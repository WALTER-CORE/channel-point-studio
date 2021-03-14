const express = require('express');
const config = require('../config/config'); 
const logger = require('../logger/logger'); 
const axios = require('axios');
const router = express.Router();

// Global fields 
let ACCESS_TOKEN = ""; 
let REFRESH_TOKEN = ""; 
let clientId = ""; 
let userId = ""; 
let headers = {}; 

const TWITCH_AUTHORIZE_URL = `https://id.twitch.tv/oauth2/authorize?client_id=${config.env.TWITCH_CLIENT_ID}&redirect_uri=${config.REDIRECT_URI}&response_type=code&scope=${config.env.SCOPES}`;

const authorize = (async (req, res) => {
  logger.info('Incoming login request, redirecting to twitch authorization');
  logger.info(`Redirecting to twitch authorize url: ${TWITCH_AUTHORIZE_URL}`)
  // TODO: Here we need to verify whether the user wants to authenticate or not. 
  res.redirect(TWITCH_AUTHORIZE_URL);
});

const redirect = (async (req, res) => {
  let oauthCode = req.query.code; 
  if (oauthCode != undefined) {
    // We have a valid oauthCode after the user logs in. So fetch the open token. 
    console.log(`OAuth code: ${oauthCode}`)
    let response = await generateAuthToken(oauthCode); 
    if (response != undefined) {
      console.log(`👍 Successfully retrieved auth token`);
      // Set the global variables for the tokens. 
      ACCESS_TOKEN = response.data.ACCESS_TOKEN; 
      REFRESH_TOKEN = response.data.REFRESH_TOKEN; 
    }
  }
  // This endpoint handles getting the token and then we redirect again to the homepage. 
  res.redirect('/');
});

/**
 * Generates user access token and refresh token with the provided OAuth code. 
 *
 * @param {string} oauthCode OAuth code
 * @returns {object} Response token 
 */
const generateAuthToken = async (oauthCode) => {
  try {
    let response = await axios({
      url: 'https://id.twitch.tv/oauth2/token', 
      method: 'post', 
      timeout: 8000, 
      headers: {
        'Content-Type': 'application/json'
      }, 
      params: {
        client_id: config.env.TWITCH_CLIENT_ID, 
        client_secret: config.env.TWITCH_CLIENT_SECRET, 
        code: oauthCode,
        grant_type: 'authorization_code',
        redirect_uri: config.redirect_uri
      }
    })
    logger.info(`👍 Successfully retrieved oauth code`)
    return response; 
  } catch (error) {
    logger.error(`🔥 Error when generating OAuth Token: ${JSON.stringify(error.response.status)}`)
    logger.error(`Error Headers: ${JSON.stringify(error.response.headers)}`)
    logger.error(`Error Data: ${JSON.stringify(error.response.data)}`)
    return; 
  }
};

/**
 * Validates the provided token and validates the token has the correct scope(s). additionally, uses the response to pull the correct client_id and broadcaster_id
 * 
 * @return {object} response code
 */
const validateToken = async (token) => {
  let response; 
  try {
    response = await axios.get(`https://id.twitch.tv/oauth2/validate`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
  } catch (error) {
    logger.error(`🔥 ${error.response.data}`)
    logger.error('Invalid token. Please login again and authorize channel point studio.'); 
    return false; 
  }

  if (response.scopes.indexOf("channel:manage:redemptions") == -1 ||response.scopes.indexOf("user:edit:follows") == -1) {
    logger.error('Invalid scopes. Please login again to generate a new authorization token'); 
    return false;
  }

  // update the global variables to returned values
  clientId = response.client_id
  userId = response.user_id
  headers = {
    "Authorization": `Bearer ${ACCESS_TOKEN}`,
    "Client-ID": clientId,
    "Content-Type": "application/json"
  }

  return true
}; 

router.get('/authorize', authorize);
router.get('/redirect', redirect); 

module.exports = router;