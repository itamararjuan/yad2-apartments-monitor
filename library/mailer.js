'use strict';

const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAILER_GMAIL_ADDRESS,
        pass: process.env.MAILER_GMAIL_PASSWORD,
    }
});

function sendMailAsync(mailTransporter, mailOptions) {
    return new Promise((resolve, reject) => {
        mailTransporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                reject(error); // rejected
            } else {
                console.log('Message sent (%s) to admins about the new service', info.messageId);
                resolve(info); // fulfilled
            }
        });
    });
}

function getHtmlBody(name) {
    return fs
        .readFileSync(path.join(__dirname, '../assets/templates/', `${name}.html`), { encoding: 'utf-8' });
}

function getNewAdsBody({ ads }) {
    let body = getHtmlBody('newads');

    body = body.replace('{count}', ads.length);
    let adsMarkup = '';

    for (let i = 0; i < ads.length; i++) {
        adsMarkup += `<li><a href="https://www.yad2.co.il/s/w/${ads[i]}" target="_blank">Apartment with Id: ${ads[i]}</a></li>`;
    }

    return body.replace('{ads}', adsMarkup);
}

function notifyOnNewAds({ ads }) {
    return new Promise((resolve) => {
        const subject = 'New apartments available!';
        const to = process.env.NOTIFY_EMAIL;

        const mailOptions = {
            from: process.env.MAILER_GMAIL_ADDRESS,
            to, // list of receivers
            subject,
            html: getNewAdsBody({ ads }),
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                throw error;
            }

            resolve();
        });
    });
}

module.exports = {
    notifyOnNewAds,
};