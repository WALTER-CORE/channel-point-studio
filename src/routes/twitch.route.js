const express = require('express');
const config = require('../config/config'); 
const logger = require('../config/logger'); 
const axios = require('axios');
const router = express.Router();
require('dotenv').config();

// Global fields 
let parsedJsonTokens = readFromJsonFile('src/temp/', 'tokens.json');

const authorize = (async (req, res) => {
  logger.info('Incoming login request, redirecting to twitch authorization');
  logger.info(`Redirecting to twitch authorize url: ${TWITCH_AUTHORIZE_URL}`)
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

router.get('/redirect', redirect); 

module.exports = router;