'use strict';

// npm modules
var Airtable = require('airtable');
var moment = require('moment');
var request = require('superagent');

// generate string payload for slack
var generatePayload = function generatePayload(conf, data) {
    var users = conf.users,
        template = conf.template,
        mentionSep = conf.mentionSep;

    var mentions = users.map(function (user) {
        return '<@' + user + '>';
    }).join(mentionSep || ' or ');
    var tform = template.replace(/\$DATA/g, data).replace(/\$MENTIONS/g, mentions);
    return tform;
};

// make call to slack
var postToSlack = function postToSlack() {
    var webhook = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var payload = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    return new Promise(function (resolve, reject) {
        return request.post(webhook).send({
            text: payload,
            mrkdwn: true
        }).end(function (err, res) {
            if (err) reject(err);else resolve(res);
        });
    });
};

// connect to airtable and return a query object
var connect = function connect() {
    var apiKey = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var conf = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    if (!apiKey || !conf) return null;

    console.log(conf);
    var tableName = conf.tableName,
        baseKey = conf.baseKey,
        view = conf.view,
        maxRecords = conf.maxRecords;


    var base = new Airtable({ apiKey: apiKey }).base(baseKey);
    return base(tableName).select({
        maxRecords: maxRecords,
        view: view
    });
}; // connect

// assemble records into arr and return promise
var _assembleRecords = function _assembleRecords() {
    var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var conf = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    return new Promise(function (resolve, reject) {
        if (!query || !conf) {
            reject("Missing required params");
            return null;
        }
        var tableName = conf.tableName,
            indexCol = conf.indexCol,
            dataCol = conf.dataCol;

        var allrecs = {};
        var forEachPage = function forEachPage(records, fetchNextPage) {
            records.forEach(function (record) {
                return allrecs[record.get(indexCol)] = record.get(dataCol);
            });
            fetchNextPage();
        };
        var done = function done(err) {
            return err ? reject(err) : resolve(allrecs);
        };
        query.eachPage(forEachPage, done);
    });
}; // _assembleRecords

// fetch records from query object, validate for date format,
// throw err or return record
var fetchPages = function fetchPages() {
    var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var conf = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    return _assembleRecords(query, conf).then(function (records) {
        var fmt = conf.fmt;

        var key = moment().format(fmt);
        return records[key];
    }).then(function (record) {
        if (typeof record === "undefined") {
            throw new Error('No record found');
        }
        return record;
    });
}; // fetchPages

// lib
var getConfigs = function getConfigs() {
    var secrets = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return {
        airtable: {
            tableName: secrets.TABLENAME || 'Problems',
            indexCol: secrets.INDEXCOL || 'Date',
            dataCol: secrets.DATACOL || 'Problem',
            baseKey: secrets.BASEKEY || 'XXXXXXXX',
            view: secrets.VIEW || 'Grid view',
            maxRecords: parseInt(secrets.MAXRECORDS, 10) || 100,
            fmt: secrets.FMT || 'YYYY-MM-DD'
        },
        slack: {
            users: secrets.USERS && secrets.USERS.split(',') || ['U85KT784S', 'U85N9D3V2'],
            template: '<!channel>: here is the *problem of the day* for today:\n```\n$DATA\n```\nRemember to hit up $MENTIONS (...or your classmates) to discuss! Goodluck!',
            mentionSep: secrets.MENTIONSEP || ' or '
        }
    };
};

// webtask context execution
var runTask = function runTask(context, cb) {
    var _getConfigs = getConfigs(context.secrets),
        airtable = _getConfigs.airtable,
        slack = _getConfigs.slack;

    var q = connect(context.secrets.AIRTABLE_API_KEY || null, airtable);
    fetchPages(q, airtable).then(function (record) {
        return postToSlack(context.secrets.SLACK_WEBHOOK, generatePayload(slack, record));
    }).then(function (resp) {
        cb(null, resp);
    }).catch(function (e) {
        console.log(e);
        cb(null, { err: e });
    });
};

// gross but necessary evil because webtask seems to
// not support linking to local dependencies...
var exportables = {
    runTask: runTask,
    generatePayload: generatePayload,
    postToSlack: postToSlack,
    connect: connect,
    fetchPages: fetchPages,
    getConfigs: getConfigs
};

if (process.env.TRAVIS_TEST_ENV) {
    module.exports = exportables;
} else {
    module.exports = runTask;
}
