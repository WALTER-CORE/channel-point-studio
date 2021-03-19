const express = require('express');
const config = require('../config/config'); 
const logger = require('../config/logger'); 
const axios = require('axios');
const validateToken = require('../middleware/validate'); 
const { writeToJsonFile, readFromJsonFile } = require('../utils/jsonUtils'); 
const router = express.Router();
require('dotenv').config();

// Global fields 
let parsedJsonTokens = readFromJsonFile('src/temp/', 'tokens.json');
let clientId = ""
let userId = "" 

const getCustomRewardRedemption = (async (req, res) => {
  logger.info(`Incoming request for redemptions of reward: ${req.query.reward_id}`);
  try {
    if (parsedJsonTokens.TWITCH_ACCESS_TOKEN == undefined) {
      logger.error('Twitch Access Token is undefined')
    } else {
      logger.info('Validating Twitch Access Token...')
      let validateResponse = validateToken(parsedJsonTokens.TWITCH_ACCESS_TOKEN); 
      clientId = validateResponse.client_id
      userId = validateResponse.user_id
    }

    let response = await axios({
      url: 'https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions', 
      method: 'get', 
      timeout: 8000, 
      headers: {
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${parsedJsonTokens.TWITCH_ACCESS_TOKEN}`, 
        'Client-ID': `${config.env.TWITCH_CLIENT_ID}`
      }, 
      params: {
        broadcaster_id: userId,
        reward_id: req.query.reward_id
      }
    })
    if (response.status == 200) {
      logger.info(`👍 Successfully retreived custom rewards redemptions for user with userId: ${userId}`)
      logger.info(response.data); 
      res.send(response); 
    }; 
  } catch (error) {
    logger.error(`🔥 Error when retrieving custom reward redemptions: ${JSON.stringify(error.response.status)}`)
    logger.error(`Error Headers: ${JSON.stringify(error.response.headers)}`)
    logger.error(`Error Data: ${JSON.stringify(error.response.data)}`)
    return; 
  }
});

const getCustomReward = (async (req, res) => {
  logger.info(`Incoming request for rewards of user: ${userId}`);
  try {
    if (parsedJsonTokens.TWITCH_ACCESS_TOKEN === undefined) {
      logger.error('Twitch Access Token is undefined')
    } else {
      let validateResponse = await validateToken(parsedJsonTokens.TWITCH_ACCESS_TOKEN); 
      clientId = validateResponse.data.client_id
      userId = validateResponse.data.user_id
    }
    logger.info(`😍 userID: ${validateResponse.data.user_id}`)

    let response = await axios({
      url: 'https://api.twitch.tv/helix/channel_points/custom_rewards', 
      method: 'get', 
      timeout: 8000, 
      headers: {
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${parsedJsonTokens.TWITCH_ACCESS_TOKEN}`,
        'Client-Id': `${config.env.TWITCH_CLIENT_ID}`
      }, 
      params: {
        broadcaster_id: userId,
      }
    })
    if (response.status == 200) {
      logger.info(`👍 Successfully retreived custom rewards for user with userId: ${userId}`)
      logger.info(response.data); 
      res.send(response); 
    }; 
  } catch (error) {
    return; 
  }
});

router.get('/custom-reward-redemption', getCustomRewardRedemption); 
router.get('/custom-reward', getCustomReward); 

module.exports = router;