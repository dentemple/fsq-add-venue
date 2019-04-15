const csv = require('csv-parser');
const fs = require('fs');
const args = require('yargs').argv;
const https = require('https');
const fetch = require('node-fetch');
const results = [];

const inputFile = args.file; // CSV file of new venue attributes
const outputFile = args.output; // Output file of new venue IDs (or duplicate IDs)
const token = args.token; // Your Foursquare OAuth token


fs.createReadStream(inputFile)
  .pipe(csv({ separator: '\t'} ))
  .on('data', x => {
    results.push({
      name: x.name,
      address: x.address,
      city: x.city,
      state: x.state,
      zip: x.zip,
      ll: x.ll,
      primaryCategoryId: x.primaryCategoryId
});
  })
  .on('end', () => {
    const venues = results;
    const fetches = venues.map(venue => {
      const name = encodeURIComponent(venue.name);
      const ll = encodeURIComponent(venue.ll);
      const address = encodeURIComponent(venue.address);
      const city = encodeURIComponent(venue.city);
      const state = encodeURIComponent(venue.state);
      const zip = encodeURIComponent(venue.zip);
      const primaryCategoryId = encodeURIComponent(venue.primaryCategoryId);
      const url = `https://api.foursquare.com/v2/venues/add?name=${name}&ll=${ll}&address=${address}&city=${city}&state=${state}&zip=${zip}&primaryCategoryId=${primaryCategoryId}&oauth_token=${token}&v=20190110`;

        return fetch(url, {
            method: 'post'
        }).then(res => {
            return res.json()
        }).then(data => {
            const statusCode = data.meta.code;
            if (statusCode === 409) {
              const duplicateVenueId = data.response.candidateDuplicateVenues[0].id;
              const duplicateVenueName = data.response.candidateDuplicateVenues[0].name;
                return {
                  duplicateVenueId,
                  duplicateVenueName,
                  statusCode
                }
            }
          if (statusCode === 200) {
            const newVenueId = data.response.venue.id;
            const newVenueName = data.response.venue.name;
              return {
                newVenueId,
                newVenueName,
                statusCode
              }
            }
            if (statusCode === 400) {
              const requestId = data.meta.requestId;
              const errorMessage = data.meta.errorDetail;
                return {
                  requestId,
                  errorMessage: errorMessage,
                  statusCode
                }
            }
        }).catch(error => {
            console.log(error)
        });
    });

    Promise.all(fetches).then((venues) => {
      fs.writeFile(outputFile, JSON.stringify(venues), function(err){
         if (err) console.log(err);
         console.log('Upload complete and successfully written to file.');
        });
    });
  });

