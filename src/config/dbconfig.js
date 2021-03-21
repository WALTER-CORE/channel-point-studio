var express = require('express');
var app = express();

var dbConn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '${MYSQL_ROOT_PASSWORD}',
    database: 'channel-point-db'
});
//Connect to DB
dbConn.connect();

//Retrieve rewards
app.get('/channel-rewards', function(res, res){
    dbConn.query('SELECT * FROM channel_rewards', function(error, results, fields) {
        if (error) throw error;
        return res.setEncoding({ error: false, data: results, message: 'list of channel rewards.'});
    });
});

//Add a new Reward
app.post('/channel-rewards', function(req, res) {
    let reward = req.body.reward;
    if (!reward) {
        return res.status(400).send({ error:true, message: 'Please provide user'});
    }
    dbConn.query("INSERT INTO channel_rewards SET ? ", {reward: reward}, function(error, results, fields) {
    if (error) throw error;
        return res.send({error: false, data: results, message: 'New reward inserted.'});    
    });
});


//Update reward with ID 
//  Update user with id
app.put('/user', function (req, res) {
    let reward_id = req.body.reward_id;
    let reward = req.body.reward;
    if (!reward_id || !reward) {
      return res.status(400).send({ error: user, message: 'Please provide reward name and reward id' });
    }
    dbConn.query("UPDATE users SET user = ? WHERE id = ?", [reward, reward_id], function (error, results, fields) {
      if (error) throw error;
      return res.send({ error: false, data: results, message: 'Reward has been updated successfully.' });
     });
    });




//Delete reward