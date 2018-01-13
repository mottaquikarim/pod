const airtable = {
    tableName: 'Problems',
    indexCol: 'Date',
    dataCol: 'Problem',
    baseKey: 'appYuybi6kTNS0Gng',
    view: 'Grid view',
    maxRecords: 100,
    fmt: 'YYYY-MM-DD',
}

const slack = {
    users: ['U85KT784S', 'U85N9D3V2'],
    template: `<!channel>: here is the *problem of the day* for today:
\`\`\`
$DATA
\`\`\`
Remember to hit up $MENTIONS (...or your classmates) to discuss! Goodluck!`,
    mentionSep: ' or ',
}
module.exports = {
    airtable,
    slack,
}
