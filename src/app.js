const express = require('express');
const routes = require('./routes/index');
const cors = require('cors')
const app = express();

// Enable cors
app.use(cors());

// Load api routes 
app.use('/api', routes);

// Default home page route 
app.get('/',  (req, res) => {
  res.status(200).send('Channel Points Server Homepage')
});

module.exports = app; 