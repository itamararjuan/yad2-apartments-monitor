require('dotenv').config()
const cheerio = require('cheerio')
const fetch = require('node-fetch');
const { difference } = require('lodash');
const { notifyOnNewAds } = require('./library/mailer');
const fs = require('fs');
const chromeUserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36";

async function getAdsIds() {
    const result = await fetch(process.env.YAD2_URL, {
        headers: {
            'User-Agent': chromeUserAgent,
        }
    });
    const s = await result.text();
    const $ = cheerio.load(s);

    const ads = $('.feed_item');
    console.log(ads.length);

    let ids = [];
    ads.each((_, ad) => {
        ids.push($(ad).attr('item-id'));
    });

    return ids;
}

// Global setup for the bot
(async function () {
    const hours = process.env.CHECK_EVERY_X_HOURS || 4;
    const sampleInterval = 60 * 1000 * 60 * parseInt(hours);
    let previousAdIds = await getAdsIds();

    setInterval(async () => {
        let tempAds = getAdsIds();
        const newAds = difference(tempAds, previousAdIds);
        if (newAds.length > 0) {
            previousAdIds = tempAds;
            await notifyOnNewAds({ ads: newAds });
        }
    }, sampleInterval);
})();
