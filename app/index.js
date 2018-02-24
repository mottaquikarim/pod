// npm modules
const Airtable = require('airtable');
const moment = require('moment');
const request = require('superagent');

// generate string payload for slack
const generatePayload = (conf, data) => {
    const {users,template,mentionSep} = conf;
    const mentions = users.map(user => `<@${user}>`).join(mentionSep || ' or ');
    const tform = template
        .replace(/\\n/g, '\n')
        .replace(/\$DATA/g, data)
        .replace(/\$MENTIONS/g, mentions);
    return tform;
}

// make call to slack
const postToSlack = (webhook=null, payload='') => new Promise((resolve, reject) => request
    .post(webhook)
    .send({
        text: payload,
        mrkdwn: true,
    })
    .end((err, res) => {
        if (err) reject(err)
        else resolve(res)
    }));

// connect to airtable and return a query object
const connect = (apiKey = null, conf = null) => {
    if (!apiKey || !conf) return null;

    console.log(conf)
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

// lib
const getConfigs = (secrets = {}) => ({
    airtable: {
        tableName: secrets.TABLENAME || 'Problems',
        indexCol: secrets.INDEXCOL || 'Date',
        dataCol: secrets.DATACOL || 'Problem',
        baseKey: secrets.BASEKEY || 'XXXXXXXX',
        view: secrets.VIEW || 'Grid view',
        maxRecords: parseInt(secrets.MAXRECORDS, 10) || 100,
        fmt: secrets.FMT || 'YYYY-MM-DD',
    },
    slack: {
        users: (secrets.USERS && secrets.USERS.split(',')) || ['U85KT784S', 'U85N9D3V2'],
        template: (secrets.TEMPLATE) || `<!channel>: here is the *problem of the day* for today:
\`\`\`
$DATA \`\`\`
Remember to hit up $MENTIONS (...or your classmates) to discuss! Goodluck!`,
        mentionSep: secrets.MENTIONSEP || ' or ',
    },
})

// webtask context execution
const runTask = (context, cb) => {
    const {airtable, slack} = getConfigs(context.secrets);
    const q = connect(context.secrets.AIRTABLE_API_KEY || null, airtable);
    fetchPages(q, airtable)
        .then(record => postToSlack(
            context.secrets.SLACK_WEBHOOK,
            generatePayload(slack, record)
        ))
        .then(resp => {
            cb(null, resp);
        })
        .catch(e => {
            console.log(e)
            cb(null, { err: e });
        });
}

// gross but necessary evil because webtask seems to
// not support linking to local dependencies...
const exportables = {
    runTask,
    generatePayload,
    postToSlack,
    connect,
    fetchPages,
    getConfigs,
};

if (process.env.TRAVIS_TEST_ENV) {
    module.exports = exportables;
}
else {
    module.exports = runTask;
}
