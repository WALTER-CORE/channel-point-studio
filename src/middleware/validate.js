const express = require('express');
const config = require('../config/config'); 
const logger = require('../config/logger'); 
const axios = require('axios');
const { writeToJsonFile, readFromJsonFile } = require('../utils/jsonUtils'); 

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
    logger.info('Successfully validated Oauth2 token'); 
    if (response.data.scopes.indexOf("channel:manage:redemptions") == -1 ||response.data.scopes.indexOf("user:edit:follows") == -1) {
      logger.error('Invalid scopes. Please login again to generate a new authorization token'); 
      return false;
    }
  
    return response; 
  } catch (error) {
    logger.error(`🔥 ${error.response.data}`)
    logger.error('Invalid token. Please login again and authorize channel point studio.'); 
    return false; 
  }

}; 

module.exports = validateToken; 