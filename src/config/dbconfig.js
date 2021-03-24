const mysql = require('mysql');

const dbConn = mysql.createConnection({
    host: 'localhost',
    user: 'user',
    password: 'pass',
    database: 'channel-point-db',
    port: '3307'
});

module.exports = dbConn;