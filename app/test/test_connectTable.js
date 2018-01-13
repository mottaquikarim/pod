const {test} = require('ava');
const {connect, fetchPages} = require('../pod/connectTable')

test('apiKey, conf must be passed in to connect', t => {
    const a = connect(null, null);
    t.is(a, null)

    const b = connect('foo', null);
    t.is(b, null)

    const c = connect(null, 'bar');
    t.is(c, null)
});
