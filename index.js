const yargs = require('yargs');
const upload = require('./upload.js');
const proposeEdit = require('./proposeedit.js');


// Upload command
yargs.command(['upload'], 'upload a file', (yargs) => {}, (argv) => {
  console.log('Uploading your file now...');
  upload();
}).argv;


// Propose edit command
yargs.command(['update'], 'update venues', (yargs) => {}, (argv) => {
  console.log('Updating your file now...');
  proposeEdit();
}).argv;






