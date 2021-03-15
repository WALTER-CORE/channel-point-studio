'use strict';
const fs = require('fs');
const logger = require('../logger/logger');

function writeToJsonFile(directory, fileName, data) {
  try {
    fs.writeFileSync(`${directory}${fileName}`, JSON.stringify(data));
    return true; 
  } catch (error) {
    logger.error(`Error with writing data to json file: ${error}`); 
    return false; 
  }
}

function readFromJsonFile(directory, fileName) {
  try {
    let rawData = fs.readFileSync(`${directory}${fileName}`); 
    return JSON.parse(rawData); 
  } catch (error) {
    logger.error(`Error with reading data from json file with file path: ${directory}`); 
    logger.error(`Error: ${error}`); 
    return false; 
  }
}

module.exports = {
  writeToJsonFile, 
  readFromJsonFile
}