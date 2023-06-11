require('dotenv').config();
const sentence = require('./sentences.js');
const express = require('express');
const app = express();
const port = process.env.PORT || 4000;
const fs = require('fs');
const nodemailer = require('nodemailer');
const { IgApiClient } = require('instagram-private-api');
const { get } = require('request-promise');
const CronJob = require('cron').CronJob;

const totalSentence = sentence.length;

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.GOOGLE_USERNAME, // generated ethereal user
    pass: process.env.GOOGLE_PASSWORD, // generated ethereal password
  },
});

const ig = new IgApiClient();

const login = async () => {
  ig.state.generateDevice(process.env.IG_USERNAME);
  await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);
  console.log('Logged in');
};

const sendMail = async () => {
  let info = await transporter.sendMail({
    from: `"Instabot 👻" <${process.env.GOOGLE_USERNAME}>`, // sender address
    to: process.env.GMAIL_SENDER, // list of receivers
    subject: 'Instabot  Post Posted✔', // Subject line
    text: `Posted to Instagram at ${new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
    })}`,
  });

  console.log('Message sent: %s', info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
};

const sendMailNotSend = async () => {
  let info = await transporter.sendMail({
    from: `"Instabot 👻 (Not)" <${process.env.GOOGLE_USERNAME}>`, // sender address
    to: process.env.GMAIL_SENDER, // list of receivers
    subject: 'Instabot  Post Posted✔', // Subject line
    text: `Not Posted to Instagram at ${new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
    })}`,
  });

  console.log('Message sent: %s', info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
};

const sendPost = async () => {
  const caption = sentence[Math.floor(Math.random() * totalSentence)];
  const imageBuffer = await get({
    url: 'https://picsum.photos/200/300',
    encoding: null,
  });
  // get from file from image.jpg file
  // const imageBuffer = fs.readFileSync("images.jpeg");

  await ig.publish.photo({
    file: imageBuffer,
    caption: caption.sentence.toString(),
  });
};

const postToInsta = async () => {
  const ifPost = Math.floor(Math.random() * 2);
  console.log('ifPost', ifPost);
  if (ifPost === 1) {
    const postTimer = 0; //Math.floor(Math.random() * 61);
    console.log('postTimer', postTimer);
    setTimeout(async () => {
      console.log(
        'Posting to Instagram at',
        new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
      );
      await sendPost();
      await sendMail();
      console.log(
        'Posted to Instagram at',
        new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
      );
    }, postTimer * 1000);
  } else {
    await sendMailNotSend();
  }
};

const cronInsta = new CronJob('*/60 * * * *', async () => {
  postToInsta();
});

login()
  .then(() => {
    cronInsta.start();
  })
  .catch((err) => {
    console.log(err);
  });
