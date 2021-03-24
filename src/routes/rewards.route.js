const express = require('express');
const logger = require('../config/logger');
const router = express.Router();
const dbConn = require('../config/dbconfig');
const { info } = require('../config/logger');



//connection to database
logger.info('Attempting to connect to database...');
dbConn.connect();
logger.info('Successfully connected');

//Retrieve rewards
const getRewardFromDB = (async (req, res) => {
    dbConn.query('SELECT * FROM channel_rewards', function(error, results, fields) {
        if (error) throw error;
        if(results.length == 0) {
            return res.status(404).send({ error: false, data: results, message: 'No rewards found.'});
        }
        return res.status(200).send({ error: false, data: results, message: 'list of channel rewards.'});
    });
});

//Add a new Reward
const postRewardToDB = (async function(req, res) {
    let reward = req.body.reward;
    logger.info(`This is post request for reward: ${reward}`);
    // if (!reward) {
    //     return res.status(400).send({ error:true, message: 'Please provide user'});
    // }
    dbConn.query("INSERT INTO channel_rewards SET ? ", reward, function(error, results, fields) {
    if (error) throw error;
        return res.status(201).send({data: results, message: 'New reward inserted.'});    
    });
});


//Update reward with ID 
const updateRewardInDB = (async function (req, res) {
    let reward_id = req.body.reward.reward_id;
    let reward = req.body.reward;
    if (!reward_id || !reward) {
      return res.status(400).send({message: 'Please provide reward name and reward id' });
    }
    dbConn.query("UPDATE channel_rewards SET ? WHERE reward_id = ?", [reward, reward_id], function (error, results, fields) {
      if (error) throw error;
      return res.status(200).send({data: results, message: 'Reward has been updated successfully.' });
     });
    });

router.get('/channel-rewards', getRewardFromDB);
router.post('/channel-rewards', postRewardToDB);
router.put('/channel-rewards', updateRewardInDB);

module.exports = router;