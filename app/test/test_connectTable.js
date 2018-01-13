const {test} = require('ava');
const {connect, fetchPages} = require('../pod/connectTable')
const {withEnvParam} = require('./helpers/withEnv')
const {airtable} = ((at) => Object.assign(at, {
    baseKey: 'appy3yLRvrVArKmhJ',
}))(require('../pod/configs'))

test('apiKey, conf must be passed in to connect', t => {
    const a = connect(null, null);
    t.is(a, null)

    const b = connect('foo', null);
    t.is(b, null)

    const c = connect(null, 'bar');
    t.is(c, null)
});

withEnvParam('AIRTABLE_TEST_API_KEY', 'return valid query object from airtable', t => {
    const a = connect(process.env.AIRTABLE_TEST_API_KEY, airtable);
    // gross af but works for now
    t.is(a.constructor.name, 'Class')
});

test('apikey, conf must be passed in to fetchPages', t => fetchPages(null, null)
    .catch(e => {
        t.is(e, 'Missing required params')
    }));

withEnvParam('AIRTABLE_TEST_API_KEY', 'throw error if record is not found', t => fetchPages(connect(process.env.AIRTABLE_TEST_API_KEY, airtable), airtable)
    .catch(e => {
        t.is(e.message, 'No record found')
    }));
