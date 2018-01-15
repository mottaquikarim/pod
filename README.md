[![Build Status](https://travis-ci.org/mottaquikarim/pod.svg?branch=master)](https://travis-ci.org/mottaquikarim/pod) [![Coverage Status](https://coveralls.io/repos/github/mottaquikarim/pod/badge.svg?branch=master&foo=bar)](https://coveralls.io/github/mottaquikarim/pod?branch=master)
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

[![scrnshot](https://github.com/mottaquikarim/remotecontrol/blob/master/assets/pod-scrnshot2.png?raw=true)](https://airtable.com/shr3P5RqRDz747vG4/tblfaahWqXucnCmOC/viwqQx6a4ZbiLz6R0)

This is a **readonly** base that demonstrates how the data should be organized. It is strongly recommended that you **copy** the base as a starting point to ensure data-types are presevered.

## To build and deploy...

There's a few steps required to deploy this script. Ideally, these steps could be made simpler - please submit PRs and ideas/issues around this!

### Install-athon

```
$ <git clone repo, cd into it>
$ cd app/
$ npm install
```

Everything is installed locally, so you will have to use `./node_modules/.bin/<script>` to run scripts. Yes, this is annoying. Yes, it is worth the pain.

### Set up Web task

If you don't have webtask CLI already set up, please do so now. **[Setting up Webtask CLI](https://webtask.io/docs/wt-cli)**.

### Secrets

In order to properly use this script, you will have to supply some scripts. In the `app/` directory you will see a `.secrets.txt.sample`.

First, let's copy it.

```
$ cd app/
$ cp .secrets.txt.sample .secrets.txt
```

Below, please find an explanation of what each key does. **NOTE**: Not all are "secrets" per-se but for now easier to keep all in one place. 

#### AIRTABLE

```
TABLENAME=Problems
INDEXCOL=Date
DATACOL=Problem
BASEKEY=XXXXXXXXXXX
VIEW=Grid view
MAXRECORDS=100
AIRTABLE_API_KEY=XXXXXXXXXXX
FMT=YYYY-MM-DD
```

| SECRET NAME  | SECRET VALUE |
| ------------- | ------------- |
| `TABLENAME`  | the name of your table in a new airtable base. Essentially, a "base" is equivalent to a google spreadsheet. Each "table" is an individual view of that spreadsheet. You are free to name your table anything you want - just point to the correct label here. |
| `INDEXCOL` | refers to the column that stores the dates for the problem of the day. |
| `DATACOL` | is the column that will store all the data to be pushed through to slack. |
| `BASEKEY` | refers to a key assigned by Airtable to the base. Pls refer to the figures below to track down your base key. |
| `AIRTABLE_API_KEY` | super important, required to connect ot Airtable. Pls refer to the figure below to track down api key. |

#### AIRTABLE KEYS

**STEP 1**: Find the '?' icon on the top right corner of the base view.
![Figure](https://github.com/mottaquikarim/pod/blob/master/assets/POD_help_icon.png?raw=true)

**STEP 2**: Click on the icon and then select the **API DOCUMENTATION** selection
![Figure](https://github.com/mottaquikarim/pod/blob/master/assets/POD_help_dropdown.png?raw=true)

**STEP 3**: On the top right of the page that opens, select the **show API Key** option
![Figure](https://github.com/mottaquikarim/pod/blob/master/assets/POD_help_API_KEY.png?raw=true)

**STEP 4**: Scroll down to the **AUTHORIZATION** section to grab the pertinent info
![Figure](https://github.com/mottaquikarim/pod/blob/master/assets/POD_help_sensitive_data.png?raw=true)
In this case, **BASEKEY** is **appy3yLRvrVArKmhJ** and **AIRTABLE_API_KEY** is **YOUR_API_KEY**.

| SECRET NAME  | SECRET VALUE |
| ------------- | ------------- |
| `VIEW` | is a value that the airtable API requires, Keeping it around in case we wanted to change ever. |
| `FMT` | airtable has a date picker column that seems to default to `YYYY-MM-DD`. |
| `MAXRECORDS` | will select only that many records in query. Not sure what the max queryable number is so we defaulted to 100, which seemed reasonable. |
```
USERS=U85KT784S,U85N9D3V2
MENSTIONSEP= or 
TEMPLATE=<!channel>: here is the *problem of the day* for today:\n\`\`\`\n$DATA\n\`\`\`\nRemember to hit up $MENTIONS (...or your classmates) to discuss! Goodluck!`,
SLACK_WEBHOOK=https://hooks.slack.com/services/XXXXXXXXXXX/XXXXXXXXXXX/XXXXXXXXXXX
```

These are Slack specific items.

| SECRET NAME  | SECRET VALUE |
| ------------- | ------------- |
| `USERS` | refers to **actual** users that can be @-mentioned when problem of the day is pushed through. Ideally these users should be TAs or student reps (this is useful to tell students how to submit solutions to the problems of the day) |
| `MENTIONSSEP` | refers to how the @-mentioned users are seperated, just formatting stuff mainly |
| `TEMPLATE` | allows for editing how the problem of the day text is formatted. `$DATA` is the content read from Airtable's `DATACOL` column. `$MENTIONS` is an assembled list of `USERS` who will be @-mentioned. The `<!channel>` will call out to the entire channel. (Look at the **Variables** section **[here](https://api.slack.com/docs/message-formatting#message_formatting)**) |
| `SLACK_WEBHOOK` | refers to slack incoming webhooks. Set that up **[here](https://api.slack.com/incoming-webhooks)** |

### DEPLOY

```
$ cd app/
$ npm run deploy -- -t sample-task -c "50 20 * * *"
```

Where `-c` is defined CRON frequency, `-t` is the name of your task. 

Donezo!

## TODOS

* Better test coverage
* More meaningful tests
* Convert more of the javascript codebase to use webpack generated 'bundle.js'
* Dedicated AWS Lambda / DynamoDB store (ie: migrate off of MyJSON API)

PRs welcome! Please follow guidelines **[here](https://github.com/mottaquikarim/remotecontrol/blob/master/CONTRIBUTE.md)**.

*This project is a **[remotecontrol](https://github.com/mottaquikarim/remotecontrol)** service.*
