const express = require('express');
const config = require('../config/config'); 
const logger = require('../config/logger');
const axios = require('axios');
const { writeToJsonFile, readFromJsonFile } = require('../utils/jsonUtils'); 
const router = express.Router();
require('dotenv').config();

// Global fields 
let parsedJsonTokens = readFromJsonFile('src/temp/', 'tokens.json');

const TWITCH_AUTHORIZE_URL = `https://id.twitch.tv/oauth2/authorize?client_id=${config.env.TWITCH_CLIENT_ID}&redirect_uri=${config.REDIRECT_URI}&response_type=code&scope=${config.env.SCOPES}`;

const authorize = (async (req, res) => {
  logger.info('Incoming login request, redirecting to twitch authorization');
  logger.info(`Redirecting to twitch authorize url: ${TWITCH_AUTHORIZE_URL}`)
  // TODO: Here we need to verify whether the user wants to authenticate or not. 
  res.redirect(TWITCH_AUTHORIZE_URL);
});

const unauthorize = (async (req, res) => {
  try {
    if (parsedJsonTokens.TWITCH_ACCESS_TOKEN == undefined) {
      logger.error('Twitch Access Token is undefined')
    }
    let response = await axios({
      url: 'https://id.twitch.tv/oauth2/revoke', 
      method: 'post', 
      timeout: 8000, 
      headers: {
        'Content-Type': 'application/json'
      }, 
      params: {
        client_id: config.env.TWITCH_CLIENT_ID,
        token: parsedJsonTokens.TWITCH_ACCESS_TOKEN
      }
    })
    if (response.status == 200) {
      logger.info(`👍 Successfully revoked oauth token, redirecting to homepage...`)
      res.redirect('/'); 
    }; 
  } catch (error) {
    logger.error(`🔥 Error when revoking OAuth Token: ${JSON.stringify(error.response.status)}`)
    logger.error(`Error Headers: ${JSON.stringify(error.response.headers)}`)
    logger.error(`Error Data: ${JSON.stringify(error.response.data)}`)
    return; 
  }
});

/**
 * This redirect route will call the generateAuthToken route with the oauthCode it gets from the request query. 
 * It also sets the tokens to the global environment variables. 
 * 
 */
const redirect = (async (req, res) => {
  let oauthCode = req.query.code; 
  if (oauthCode != undefined) {
    // We have a valid oauthCode after the user logs in. So fetch the open token. 
    console.log(`OAuth code: ${oauthCode}`)
    let response = await generateAuthToken(oauthCode); 
    writeTokensToJson(response); 
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
        redirect_uri: config.REDIRECT_URI
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

const refreshAuthToken = (async (req, res) => {
  try {
    let response = await axios({
      url: 'https://id.twitch.tv/oauth2/token', 
      method: 'post', 
      timeout: 8000, 
      headers: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      }, 
      params: {
        grant_type: 'refresh_token',
        refresh_token: parsedJsonTokens.TWITCH_REFRESH_TOKEN,
        client_id: config.env.TWITCH_CLIENT_ID,
        client_secret: config.env.TWITCH_CLIENT_SECRET 
      }
    })
    if (response.status == 200) {
      logger.info(`👍 Successfully refreshed oauth token, redirecting to homepage`)
      writeTokensToJson(response);
      res.redirect('/')
    }    
  } catch (error) {
    logger.error(error.response.url)
    logger.error(`🔥 Error when revoking OAuth Token: ${JSON.stringify(error.response.status)}`)
    logger.error(`Error Headers: ${JSON.stringify(error.response.headers)}`)
    logger.error(`Error Data: ${JSON.stringify(error.response.data)}`)
    return false; 
  }
}); 

const writeTokensToJson = async (response) => {
  if (response != undefined) {
    let tokens = { 
      TWITCH_ACCESS_TOKEN: response.data.access_token,
      TWITCH_REFRESH_TOKEN: response.data.refresh_token
    }
    logger.info(`Writing tokens to temp JSON file`); 
    writeToJsonFile('src/temp/', 'tokens.json', tokens); 
  }
}

router.get('/authorize', authorize);
router.get('/refresh', refreshAuthToken);
router.get('/unauthorize', unauthorize); 
router.get('/redirect', redirect); 

module.exports = router;