require('dotenv').config();

// Constants 
const PORT = 8000; 
const REDIRECT_URI = `http://localhost:${PORT}/redirect`
const ENVIRONMENT_VARIABLES = {
  TWITCH_CLIENT_ID,
  TWITCH_CLIENT_SECRET,
  SCOPES,
} = process.env;

 
module.exports = {
  PORT, 
  REDIRECT_URI,
  env: ENVIRONMENT_VARIABLES, 
}