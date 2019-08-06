const csv = require('csv-parser');
const fs = require('fs');
const args = require('yargs').argv;
const https = require('https');
const fetch = require('node-fetch');
const results = [];

const inputFile = args.file; // CSV file of new venue attributes
const outputFile = args.output; // Output file of new venue IDs (or duplicate IDs)
const token = args.token; // Your Foursquare OAuth token

module.exports = function upload() {
  fs.createReadStream(inputFile)
    .pipe(
      csv({
        separator: '\t'
      })
    )
    .on('data', x => {
      results.push({
        name: x.name,
        address: x.address,
        city: x.city,
        state: x.state,
        zip: x.zip,
        ll: x.ll,
        primaryCategoryId: x.primaryCategoryId,
        crossStreet: x.crossStreet,
        phone: x.phone,
        allCategoryIds: x.allCategoryIds,
        parentId: x.parentId,
        cc: x.cc,
        twitter: x.twitter,
        description: x.description,
        url: x.url,
        chainIds: x.chainIds
      });
    })
    .on('end', () => {
      const venues = results;
      const fetches = venues.map((venue, index) => {
        const rowNumber = index + 1;
        let urlParams = '';
        const params = Object.keys(venue);
        const values = Object.values(venue);

        // Build the url parameters
        for (param in params) {
          if (params[param] && values[param]) {
            urlParams +=
              '&' + params[param] + '=' + encodeURIComponent(values[param]);
          }
        }

        const url = `https://api.foursquare.com/v2/venues/add?oauth_token=${token}&v=20190110${urlParams}`;

        return fetch(url, {
          method: 'post'
        })
          .then(res => {
            return res.json();
          })
          .then(data => {
            const statusCode = data.meta.code;
            console.log(statusCode, data);
            if (statusCode === 409) {
              const duplicateVenueId =
                data.response.candidateDuplicateVenues[0].id;
              const duplicateVenueName =
                data.response.candidateDuplicateVenues[0].name;
              return {
                rowNumber,
                duplicateVenueId,
                duplicateVenueName,
                statusCode
              };
            }
            if (statusCode === 200) {
              const newVenueId = data.response.venue.id;
              const newVenueName = data.response.venue.name;
              return {
                rowNumber,
                newVenueId,
                newVenueName,
                statusCode
              };
            }
            if (statusCode === 400) {
              const requestId = data.meta.requestId;
              const errorMessage = data.meta.errorDetail;
              return {
                rowNumber,
                requestId,
                errorMessage,
                statusCode
              };
            }
            if (statusCode === 500) {
              const errorType = data.meta.errorType;
              const errorDetail = data.meta.errorDetail;
              return {
                rowNumber,
                errorType,
                errorDetail,
                statusCode
              };
            }
          })
          .catch(err => {
            console.log(err);
          });
      });

      Promise.all(fetches).then(venues => {
        fs.writeFile(outputFile, JSON.stringify(venues), function(err) {
          if (err) console.log(err);
          console.log('Upload complete and successfully written to file.');
        });
      });
    });
};
