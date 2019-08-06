const csv = require('csv-parser');
const fs = require('fs');
const args = require('yargs').argv;
const https = require('https');
const fetch = require('node-fetch');
const venues = [];

const inputFile = args.file; // CSV file of new venue attributes
const outputFile = args.output; // Output file of new venue IDs (or duplicate IDs)
const token = args.token; // Your Foursquare OAuth token

module.exports = function deleteFields() {
  fs.createReadStream(inputFile)
    .pipe(
      csv({
        separator: '\t'
      })
    )
    .on('data', x => {
      venues.push({
        venueid: x.VENUE_ID,
        fields: x.fields
      });
    })
    .on('end', () => {
      const fetches = venues.map((venue, index) => {
        const rowNumber = index + 1;
        const fields = venue.fields.split(',');
        const venueid = venue.venueid;

        // Build field params
        const deleteFields = fields
          .map(field => {
            return '&' + field + '=';
          })
          .join('');

        const url = `https://api.foursquare.com/v2/venues/${venueid}/proposeedit?oauth_token=${token}&v=20190110${deleteFields}`;

        return fetch(url, {
          method: 'post'
        })
          .then(res => {
            return res.json();
          })
          .then(data => {
            const statusCode = data.meta.code;
            if (statusCode === 200) {
              return {
                rowNumber,
                venueid,
                statusCode: statusCode + ' Success'
              };
            }
            if (statusCode === 400) {
              const requestId = data.meta.requestId;
              const errorMessage = data.meta.errorDetail;
              return {
                rowNumber,
                requestId,
                venueid,
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
          console.log('Update complete and successfully written to file.');
        });
      });
    });
};
