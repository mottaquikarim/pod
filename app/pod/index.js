// lib
const configs = require('./configs')
const {connect, fetchPages} = require('./connectTable')
const {generatePayload, postToSlack} = require('./connectSlack')

// extract airtable data
const {airtable} = configs;

// extract slack data
const {slack} = configs;

// webtask context execution
module.exports = (context, cb) => {
    const q = connect(context.secrets.AIRTABLE_API_KEY || null, airtable);
    fetchPages(q, airtable)
        .then(record => {
            console.log(record)
            cb(null, { success: true});
        })
        .catch(e => {
            cb(null, { err: e });
        });
}