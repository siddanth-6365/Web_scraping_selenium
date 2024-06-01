const { Builder, By, until } = require("selenium-webdriver");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const chrome = require("selenium-webdriver/chrome");
const Trend = require("./db");
require("dotenv").config();
const env = process.env;

async function getTrendingTopics() {
  const proxy = `http://${env.proxy_username}:${env.proxy_password}@${env.proxy_host}:${env.proxy_port}`;
  const options = new chrome.Options();
  options.addArguments(`--proxy-server=${proxy}`);

  const driver = new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  try {
    await driver.get("https://x.com/home");

    // Wait for the trending section to be located
    const trendingSection = await driver.wait(
      until.elementLocated(
        By.css('section[aria-labelledby="accessible-list-0"]')
      ),
      10000
    );

    console.log("trendingSection located");

    // Find all the trending items within the trending section
    const trends = await trendingSection.findElements(
      By.css('div[data-testid="trend"]')
    );

    let trendingTopics = [];
    for (let i = 0; i < 5; i++) {
      trendingTopics.push(await trends[i].getText());
    }

    const ipResponse = await axios.get("https://api.ipify.org?format=json", {
      proxy: false,
    });
    const ip = ipResponse.data.ip;

    const record = new Trend({
      id: uuidv4(),
      trends: trendingTopics,
      dateTime: new Date(),
      ip: ip,
    });

    await record.save();
  } catch (error) {
    console.error("Error fetching trends:", error);
  } finally {
    await driver.quit();
  }
}

module.exports = getTrendingTopics;
