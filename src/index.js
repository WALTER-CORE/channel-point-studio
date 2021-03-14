const app = require('./app');
const config = require('./config/config'); 
const logger = require('./logger/logger'); 

logger.info('Server Process Starting'); 

// Note that there's not much logic in this file.
// The server should be mostly "glue" code to set things up and
// then start listening
app.listen(config.PORT, function(error) {
  if (error) {
    logger.error('Unable to listen for connections', error); 
    process.exit(10)
  }
  logger.info(`⚡️[server]: Server is running at http://localhost:${config.PORT}`); 
});