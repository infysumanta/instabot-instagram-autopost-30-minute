require("dotenv").config();

const express = require("express");
const app = express();
const port = process.env.PORT || 4000;
const fs = require("fs");
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

const { IgApiClient } = require("instagram-private-api");
const { get } = require("request-promise");
const CronJob = require("cron").CronJob;

const ig = new IgApiClient();

const login = async () => {
  ig.state.generateDevice(process.env.IG_USERNAME);
  await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);
  console.log("Logged in");
};

const postToInsta = async () => {
  console.log(
    "Posting to Instagram at",
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );

  const imageBuffer = await get({
    url: "https://picsum.photos/200/300",
    encoding: null,
  });
  // get from file from image.jpg file
  // const imageBuffer = fs.readFileSync("images.jpeg");

  await ig.publish.photo({
    file: imageBuffer,
    caption: "Really nice photo from the internet!",
  });
  console.log(
    "Posted to Instagram at",
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );
};

const cronInsta = new CronJob("*/30 * * * *", async () => {
  postToInsta();
});

login()
  .then(() => {
    postToInsta();
    cronInsta.start();
  })
  .catch((err) => {
    console.log(err);
  });
