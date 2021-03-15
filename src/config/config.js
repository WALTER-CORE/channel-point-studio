require('dotenv').config();

// Constants 
const PORT = process.env.EXPRESS_PORT || 8000;
                                          // TODO: Add an actual production url.   
const BASE_URL = (process.env.NODE_ENV === 'production') ? '0.0.0.0' : '127.0.0.1';
const REDIRECT_URI = (BASE_URL === '127.0.0.1') ? `http://localhost:${PORT}/api/auth/redirect` : `${BASE_URL}:${PORT}/api/auth/redirect`; 
const ENVIRONMENT_VARIABLES = {
  TWITCH_CLIENT_ID,
  TWITCH_CLIENT_SECRET,
  SCOPES,
} = process.env;

 
module.exports = {
  PORT, 
  BASE_URL,
  REDIRECT_URI,
  env: ENVIRONMENT_VARIABLES, 
}