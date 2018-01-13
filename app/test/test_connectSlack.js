const {test} = require('ava');
const {generatePayload} = require('../pod/connectSlack')
const {slack} = require('../pod/configs')

test('message is formatted correctly', t => {
    const str = generatePayload(slack, 'DATA_TST')
    t.is(str, `<!channel>: here is the *problem of the day* for today:
\`\`\`
DATA_TST
\`\`\`
Remember to hit up <@U85KT784S> or <@U85N9D3V2> (...or your classmates) to discuss! Goodluck!`)
})


