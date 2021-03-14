// Require depedancies
'use strict'
const express = require('express');
const app = express();
const PORT = 8000;
const axios = require('axios');
const cors = require('cors');
app.use(cors());
require('dotenv').config();

// Constants 
const REDIRECT_URI = `http://localhost:${PORT}/redirect`
const {
  TWITCH_CLIENT_ID,
  TWITCH_CLIENT_SECRET,
  SCOPES,
} = process.env;

// Global fields 
let ACCESS_TOKEN = ""; 
let REFRESH_TOKEN = ""; 
let clientId = ""; 
let userId = ""; 
let headers = {}; 

/**
 * Validates the provided token and validates the token has the correct scope(s). additionally, uses the response to pull the correct client_id and broadcaster_id
 * 
 * @return {object} response code
 */
const validateToken = async () => {
  let response; 
  try {
    response = await axios.get(`https://id.twitch.tv/oauth2/validate`, {
      headers: {
        "Authorization": `Bearer ${ACCESS_TOKEN}`
      }
    })
  } catch (error) {
    console.log(`🔥 ${error}`)
    console.log('Invalid token. Please login again and authorize channel points studio.'); 
    return false; 
  }

  if (response.scopes.indexOf("channel:manage:redemptions") == -1 ||response.scopes.indexOf("user:edit:follows") == -1) {
    console.log('Invalid scopes. Please get a new token using twitch token -u -s "channel:manage:redemptions user:edit:follows"'); 
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
}

/**
 * Generates user access token and refresh token with the provided OAuth code. 
 *
 * @param {string} oauthCode OAuth code
 * @returns {object} Response token 
 */
const generateToken = async (oauthCode) => {
  try {
    let response = await axios({
      url: 'https://id.twitch.tv/oauth2/token', 
      method: 'post', 
      timeout: 8000, 
      headers: {
        'Content-Type': 'application/json'
      }, 
      params: {
        client_id: TWITCH_CLIENT_ID, 
        client_secret: TWITCH_CLIENT_SECRET, 
        code: oauthCode,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI
      }
    })
    console.log(`👍 Successfully retrieved oauth code`)
    return response; 
  } catch (error) {
    console.log(`🔥 ${error}`)
    error.json().then((body) => {
      console.log(body);
    });
    return; 
  }
};

// TODO: clean this up and add it to a method. 
const TWITCH_AUTHORIZE_URL = `https://id.twitch.tv/oauth2/authorize?client_id=${TWITCH_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${SCOPES}`;

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
  res.status(200).send('Channel Points Server Homepage')
});

app.route('/login').get(async (req, res) => {
  console.log('Incoming login request, redirecting to twitch authorization');
  // TODO: Here we need to verify whether the user wants to authenticate or not. 
  res.redirect(TWITCH_AUTHORIZE_URL);
});

app.get('/redirect', async (req, res) => {
  let oauthCode = req.query.code; 
  if (oauthCode != undefined) {
    // We have a valid oauthCode after the user logs in. So fetch the open token. 
    let response = await generateToken(oauthCode); 
    console.log(`👍 Successfully received auth token`);
    // Set the global variables for the tokens. 
    ACCESS_TOKEN = response.data.ACCESS_TOKEN; 
    REFRESH_TOKEN = response.data.REFRESH_TOKEN; 
  }
  // This endpoint handles getting the token and then we redirect again to the homepage. 
  res.redirect('/'); 
});