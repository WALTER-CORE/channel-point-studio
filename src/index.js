// Require depedancies
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 8000;
const axios = require('axios');
const bodyParser = require('body-parser')

require('dotenv').config();

app.use(cors());
app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});

const customRewardBody = {
  title: "Sample: Follow me!",
  prompt: "Follows the requesting user!",
  cost: 10 * 1000 * 1000,
  is_enabled: true,
  is_global_cooldown_enabled: true,
  global_cooldown_seconds: 10 * 60,
}

let clientId = process.env['TWITCH_CLIENT_ID']
let userId = ""
let headers = {}
let rewardId = ""
let pollingInterval

const REDIRECT_URI = `http://localhost:${PORT}`
const {
  TWITCH_CLIENT_ID,
  TWITCH_ACCESS_TOKEN,
  SCOPES,
} = process.env;

// Prompts a user to authorize the application.
const authorizeApplication = async () => {
  try {
    let response = await axios({
      url: 'https://id.twitch.tv/oauth2/authorize',
      method: 'redirect', 
      timeout: 8000, 
      headers: {
        'Content-Type': 'application/json'
      }, 
      params: {
        client_id: clientId, 
        redirect_uri: redirectUri, 
        response_type: 'code', 
        scope: 'channel:manage:redemptions user:edit:follows'
      }
    })
    if (response.status == 200) {
      console.log(`Successful call: ${response.status}`)
      return response; 
    } else {
      console.log(`Bad response: ${response.status} error: ${response.error}`)
    }
  } catch (error) {
    console.log('⚠ Error: User did not authorize application: ' + error) 
    return false; 
  }
}

// validates the provided token and validates the token has the correct scope(s). additionally, uses the response to pull the correct client_id and broadcaster_id
const validateToken = async () => {
  let response; 
  try {
    let { body } = await axios.get(`https://id.twitch.tv/oauth2/validate`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
    response = JSON.parse(body)
  } catch (error) {
    console.log(error);
    console.log('Invalid token. Please get a new token using twitch token -u -s "channel:manage:redemptions user:edit:follows"'); 
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
    "Authorization": `Bearer ${token}`,
    "Client-ID": clientId,
    "Content-Type": "application/json"
  }

  return true
}

// returns an object containing the custom rewards, or if an error, null
const getCustomRewards = async () => {
  try {
    let { body } = await got(`https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${userId}`, { headers: headers })
    return JSON.parse(body).data
  } catch (error) {
    console.log(error)
    return null
  }
}

// if the custom reward doesn't exist, creates it. returns true if successful, false if not
const addCustomReward = async () => {
  try {
    let { body } = await got.post(`https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${userId}`, {
      headers: headers,
      body: JSON.stringify(customRewardBody),
      responseType: 'json',
    })

    rewardId = body.data[0].id
    return true
  } catch (error) {
    console.log("Failed to add the reward. Please try again.")
    return false
  }
}

// function for polling every 15 seconds to check for user redemptions 
const pollForRedemptions = async () => {
  try {
    let { body } = await got(`https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions?broadcaster_id=${userId}&reward_id=${rewardId}&status=UNFULFILLED`, {
      headers: headers,
      responseType: 'json',
    })

    let redemptions = body.data
    let successfulRedemptions = []
    let failedRedemptions = []

    for (let redemption of redemptions) {
      // can't follow yourself :) 
      if (redemption.broadcaster_id == redemption.user_id) {
        failedRedemptions.push(redemption.id)
        continue
      }
      // if failed, add to the failed redemptions
      if (await followUser(redemption.broadcaster_id, redemption.user_id) == false) {
        failedRedemptions.push(redemption.id)
        continue
      }
      // otherwise, add to the successful redemption list
      successfulRedemptions.push(redemption.id)
    }

    // do this in parallel
    await Promise.all([
      fulfillRewards(successfulRedemptions, "FULFILLED"),
      fulfillRewards(failedRedemptions, "CANCELED")
    ])

    console.log(`Processed ${successfulRedemptions.length + failedRedemptions.length} redemptions.`)

    // instead of an interval, we wait 15 seconds between completion and the next call
    pollingInterval = setTimeout(pollForRedemptions, 15 * 1000)
  } catch (error) {
    console.log("Unable to fetch redemptions.")
  }
}

// Follows from the user (fromUser) to another user (toUser). Returns true on success, false on failure
const followUser = async (fromUser, toUser) => {
  try {
    await got.post(`https://api.twitch.tv/helix/users/follows?from_id=${fromUser}&to_id=${toUser}`, { headers: headers })
    return true
  } catch (error) {
    console.log(`Unable to follow user ${toUser}`)
    return false
  }
  }

const fulfillRewards = async (ids, status) => {
  // if empty, just cancel
  if (ids.length == 0) {
    return
  }

  // transforms the list of ids to ids=id for the API call
  ids = ids.map(v => `id=${v}`)

  try {
    await got.patch(`https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions?broadcaster_id=${userId}&reward_id=${rewardId}&${ids.join("&")}`, {
      headers,
      json: {
        status: status
      }
    })
  } catch (error) {
    console.log(error)
  }
}

// main function - sets up the reward and sets the interval for polling
const main = async () => {
  authorizeApplication()

  // if (await validateToken() == false) {
  //   return
  // }

  // let rewards = await getCustomRewards()

  // rewards.forEach(v => {
  //   // since the title is enforced as unique, it will be a good identifier to use to get the right ID on cold-boot
  //   if (v.title == customRewardBody.title) {
  //     rewardId = v.id
  //   }
  // })

  // // if the reward isn't set up, add it 
  // if (rewardId == "" && await addCustomReward() == false) {
  //   return
  // }

  // pollForRedemptions()
}

/**
 * Generates token
 *
 * @param {string} oauthCode OAuth code
 */
const generateToken = async (oauthCode) => {
  try {
    let params = {
      client_id: TWITCH_CLIENT_ID, 
      client_secret: TWITCH_ACCESS_TOKEN, 
      code: oauthCode,
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_URI
    }
    console.log(`PARAMETERS: ${JSON.stringify(params)}`); 
    let response = await axios({
      url: 'https://id.twitch.tv/oauth2/token', 
      method: 'post', 
      timeout: 8000, 
      headers: {
        'Content-Type': 'application/json'
      }, 
      params: params
    })
    console.log(`Successful call to get token: ${response.status}`)
    return response; 
  } catch (error) {
    console.log(error)
    error.json().then((body) => {
      console.log(body);
    });
    return false; 
  }
};

const TWITCH_AUTHORIZE_URL = `https://id.twitch.tv/oauth2/authorize?client_id=${TWITCH_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${SCOPES}`;

app.route('/login').get(async (req, res) => {
  console.log('Incoming login request, redirecting to twitch authorization');
  // TODO: Here we need to verify whether the user wants to authenticate or not. 
  res.redirect(TWITCH_AUTHORIZE_URL);
});

app.get('/', async (req, res) => {
  let oauthCode = req.query.code; 
  if (oauthCode != undefined) {
    // We have a valid oauthCode after the user logs in. So fetch the open token. 
    let response = await generateToken(oauthCode); 
    console.log(`Access Token: ${response.data.access_token}`)
    console.log(`Refresh Token: ${response.data.refresh_token}`)
  }
  console.log(`Code after redirect url: ${oauthCode}`); 
  res.status(200).send('Channel Points Server Homepage')
});

app.get('/redirect', (req, res) => {
  let oauthCode = req.query.code; 
  console.log(`Code after redirect url: ${oauthCode}`); 
  res.status(200).send('Welcome to the redirect page')
});