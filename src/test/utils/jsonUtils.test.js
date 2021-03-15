'use strict'
const { writeToJsonFile, readFromJsonFile } = require('../../utils/jsonUtils'); 

let data = {
  ACCESS_TOKEN: 'your secret access token'
}

test('write to json file', () => {
  expect(writeToJsonFile('src/test/resources/temp/', 'token.json', data)).toBe(true);
});

test('read from json file', () => {
  let parsedJsonData = readFromJsonFile('src/test/resources/temp/', 'token.json'); 
  expect(JSON.stringify(parsedJsonData)).toBe(JSON.stringify(data));
});