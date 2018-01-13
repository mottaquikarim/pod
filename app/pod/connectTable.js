// npm modules
const Airtable = require('airtable');
const moment = require('moment');

// connect to airtable and return a query object
const connect = (apiKey = null, conf = null) => {
    if (!apiKey || !conf) return null;

    const {tableName, baseKey, view, maxRecords} = conf;

    const base = new Airtable({apiKey,}).base(baseKey);
    return base(tableName).select({
        maxRecords,
        view,
    }); 
} // connect

// assemble records into arr and return promise
const _assembleRecords = (query = null, conf = null) => new Promise((resolve, reject) => {
    if (!query || !conf) {
        reject("Missing required params");
        return null;
    }
    const {tableName, indexCol, dataCol} = conf;
    const allrecs = {};
    const forEachPage = (records, fetchNextPage) => {
        records.forEach(record => allrecs[record.get(indexCol)] = record.get(dataCol))
        fetchNextPage();
    };
    const done = err => err ? reject(err) : resolve(allrecs);
    query.eachPage(forEachPage, done);
}); // _assembleRecords

// fetch records from query object, validate for date format,
// throw err or return record
const fetchPages = (query = null, conf = null) => _assembleRecords(query, conf)
    .then(records => {
        const {fmt} = conf;
        const key = moment().format(fmt)
        return records[key];
    })
    .then(record => {
        if (typeof record === "undefined") {
            throw new Error('No record found');
        }
        return record;
    }); // fetchPages

module.exports = {
    connect,
    fetchPages,
}
