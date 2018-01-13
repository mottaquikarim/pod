// npm modules
const request = require('superagent');

const generatePayload = (conf, data) => {
    const {users,template,mentionSep} = conf;
    const mentions = users.map(user => `<@${user}>`).join(mentionSep || ' or ');
    const tform = template
        .replace(/\$DATA/g, data)
        .replace(/\$MENTIONS/g, mentions);
    return tform;
}

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

module.exports = {
    generatePayload,
    postToSlack,
}
