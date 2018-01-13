# Problem of the Day

*🎉🎈🎂🍾🎊🍻💃*

*Daily, automated problem of the day slack notifications.*

In Webtask online editor, added `AIRTABLE_API_KEY` secret.
CRON is set for: 48 0 * * *

**[Airtable Sauce](https://airtable.com/appYuybi6kTNS0Gng/api/docs#nodejs/table:problems:list)**

Simple serverless script that will post a practice problem to a prespecified slack channel daily. The daily portion is achieved with a configured CRON job on [Webtask](https://webtask.io/). This job will invoke a function that POSTs to a [Slack Incoming Webhook](https://api.slack.com/incoming-webhooks). Problems are managed via [Airtable](https://airtable.com/) which provides a robust API for reading data to be pushed through the pipes to the slack channel.

## FEATURES

* Support multiple users (for managing practice problems) via Airtable.
* Configurable CRON support for daily, bi-weekly, weekly, etc post frequency.
* Easily deployable to Webtask itself.
* Fire and forget, easy to resuse.

## AIRTABLE 

**[Airtable Base](https://airtable.com/shr3P5RqRDz747vG4/tblfaahWqXucnCmOC/viwqQx6a4ZbiLz6R0)**

[![scrnshot](https://github.com/mottaquikarim/remotecontrol/blob/master/assets/pod-scrnshot.png?raw=true)](https://airtable.com/shr3P5RqRDz747vG4/tblfaahWqXucnCmOC/viwqQx6a4ZbiLz6R0)


## TODOS

* Better test coverage
* More meaningful tests
* Convert more of the javascript codebase to use webpack generated 'bundle.js'
* Dedicated AWS Lambda / DynamoDB store (ie: migrate off of MyJSON API)

PRs welcome! Please follow guidelines **[here](https://github.com/mottaquikarim/remotecontrol/blob/master/CONTRIBUTE.md)**.

*This project is a **[remotecontrol](https://github.com/mottaquikarim/remotecontrol)** service.*
