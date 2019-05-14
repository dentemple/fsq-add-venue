const yargs = require('yargs');
const upload = require('./upload.js');
const proposeEdit = require('./propose-edit.js');
const deleteFields = require('./delete-fields.js');


// Upload command
yargs.command(['upload'], 'upload a file', (yargs) => {}, (argv) => {
  console.log('Uploading your file now...');
  upload();
}).argv;


// Propose edit command
yargs.command(['update'], 'update venues', (yargs) => {}, (argv) => {
  console.log('Updating your fields now...');
  proposeEdit();
}).argv;


// Delete fields command
yargs.command(['delete'], 'delete fields', (yargs) => {}, (argv) => {
  console.log('Deleting your fields now...');
  deleteFields();
}).argv;





