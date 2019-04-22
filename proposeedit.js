const csv = require('csv-parser');
const fs = require('fs');
const args = require('yargs').argv;
const https = require('https');
const fetch = require('node-fetch');
const results = [];

const inputFile = args.file; // CSV file of new venue attributes
const outputFile = args.output; // Output file of new venue IDs (or duplicate IDs)
const token = args.token; // Your Foursquare OAuth token


module.exports = function proposeEdit() {
  fs.createReadStream(inputFile)
    .pipe(csv({
      separator: '\t'
    }))
    .on('data', x => {
      results.push({
        venueid: x.VENUE_ID,
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
        menuUrl: x.menuUrl,
        facebookUrl: x.facebookUrl,
        venuell: x.venuell,
        removeCategoryIds: x.removeCategoryIds,
        hours: x.hours

      });
    })
    .on('end', () => {
      const venues = results;
      const fetches = venues.map((venue, index) => {
        const rowNumber = index + 1;
        let urlParams = '';
        const params = Object.keys(venue);
        const values = Object.values(venue);
        const venueid = encodeURIComponent(venue.venueid);

        // Build the url parameters
        for (param in params) {
          if (params[param] && values[param] && params[param] != venueid) {
            urlParams += '&' + params[param] + '=' + encodeURIComponent(values[param])
          }
        }

        const url = `https://api.foursquare.com/v2/venues/${venueid}/proposeedit?oauth_token=${token}&v=20190110${urlParams}`;

        return fetch(url, {
          method: 'post'
        }).then(res => {
          return res.json()
        }).then(data => {
          const statusCode = data.meta.code;
          if (statusCode === 200) {
            return {
              rowNumber,
              venueid,
              statusCode: statusCode + ' Success'
            }
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
            }
          }
          if (statusCode === 500) {
            const errorType = data.meta.errorType;
            const errorDetail = data.meta.errorDetail;
            return {
              rowNumber,
              errorType,
              errorDetail,
              statusCode
            }
          }
        }).catch(err => {
          console.log(err)
        });
      });

      Promise.all(fetches).then((venues) => {
        fs.writeFile(outputFile, JSON.stringify(venues), function(err) {
          if (err) console.log(err);
          console.log('Update complete and successfully written to file.');
        });
      });
    });
};

