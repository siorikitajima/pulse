const express = require('express');
const app = express();
var cors = require('cors');
require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2');
const twitterClient = new TwitterApi(process.env.TOKEN);
const roClient = twitterClient.readOnly;

app.listen(3000, () => { console.log('Omar listening...') });
app.use(cors());

// Twitter Query
var querHate = 'hate -love -happy -sex -enjoy -warmth -sweet -lovely -happiness -is:retweet -is:reply -has:links -has:mentions lang:en';
var querLove = 'love -hate -kill -murder -sex -disgusting -hatred -is:retweet -is:reply -has:links -has:mentions lang:en';

app.get('/', (req, res) => {
    res.send('Welcome to the mood API. <a href="https://pulse.patternbased.com/">This is the front page.</a>')
});

app.get('/tweets', async (req, res) => {

    try {
        // 10 Tweet texts
        const loveTweets = await roClient.v2.search( querLove, { 'tweet.fields': 'created_at' } );

        let lovenum = loveTweets.data.data.length;
        let lovemin = [];
        for (let l = 0; l < lovenum-1; l++) {
            let onelove = { 
                text: loveTweets.data.data[l].text,
                created_at: loveTweets.data.data[l].created_at
             }
            lovemin.push(onelove);
        }

        const hateTweets = await roClient.v2.search( querHate, { 'tweet.fields': 'created_at' } );

        let hatenum = hateTweets.data.data.length;
        let hatemin = [];
        for (let l = 0; l < hatenum-1; l++) {
            let onehate = { 
                text: hateTweets.data.data[l].text,
                created_at: hateTweets.data.data[l].created_at
            }
            hatemin.push(onehate);
        }

        const tweets = {loves: lovemin, hates: hatemin}
        
        res.send(tweets)


        // res.send(lovetweets.data.data[0].text)
    } catch(e) {
        res.send(e)
    }
    
})

app.get('/counts', async (req, res) => {
    try {
        let now = new Date();
        let hourAgo = new Date(now - (60 * 60 * 1000));
        let fiveDaysAgo = new Date(hourAgo - (86400 * 1000 * 3));
        let end = hourAgo.toISOString();
        let start = fiveDaysAgo.toISOString();
        console.log(start, end);
        
        // Tweet counts
        const loveCounts = await roClient.v2.tweetCountRecent(querLove, {start_time: start, end_time: end});
        const hateCounts = await roClient.v2.tweetCountRecent(querHate, {start_time: start, end_time: end});

        let summary = [];

        for (let l = 0; l < loveCounts.data.length; l++) {
            let hourlyLove = {
                timeStamp: loveCounts.data[l].start,
                love: loveCounts.data[l].tweet_count
            };
            summary.push(hourlyLove);
        }

        for (let h = 0; h < hateCounts.data.length; h++) {
            summary[h].hate = hateCounts.data[h].tweet_count
        }

        // let summaryData = { summary: summary }

        // const counts = {love: loveCounts.data, hate: hateCounts.data}
        
        res.send(summary)
    } catch(e) {
        res.send(e)
    }
    
})

