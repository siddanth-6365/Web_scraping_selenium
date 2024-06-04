const {
  Builder,
  By,
  until,
  Browser,
  Capabilities,
} = require("selenium-webdriver");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const chrome = require("selenium-webdriver/chrome");
const Trend = require("./db");
require("dotenv").config();
const env = process.env;
const chromeCapabilities = Capabilities.chrome();

async function getTrendingTopics() {
  // const proxyServer = `http://${env.PROXYMESH_USERNAME}:${env.PROXYMESH_PASSWORD}@uk.proxymesh.com:31280`;

  // chromeCapabilities.set("goog:chromeOptions", {
  //   args: [ `--proxy-server=${proxyServer}`],
  // });

  chromeCapabilities.set("goog:chromeOptions", {
    args: ["--headless", "--disable-gpu"],
  });

  const driver = new Builder()
    .forBrowser(Browser.CHROME)
    .setChromeOptions(chromeCapabilities)
    .build();

  // .withCapabilities(chromeCapabilities)

  // .setChromeOptions(options)

  try {
    console.log("starting");
    await driver.get("https://x.com/i/flow/login");
    // Twitter Login
    const usernameInput = await driver.wait(
      until.elementLocated(By.css('input[name="text"]')),
      20000
    );
    console.log("usernameInput :", usernameInput);
    await usernameInput.sendKeys(env.TWITTER_USERNAME);

    const nextButton = await driver.findElement(
      By.xpath("//span[text()='Next']/ancestor::button")
    );
    console.log("nextButton :", nextButton);
    await nextButton.click();

    const passwordInput = await driver.wait(
      until.elementLocated(By.css('input[name="password"]')),
      20000
    );
    console.log("password :", passwordInput);
    await passwordInput.sendKeys(env.TWITTER_PASSWORD);

    const loginButton = await driver.wait(
      until.elementLocated(
        By.css('button[data-testid="LoginForm_Login_Button"]')
      ),
      20000
    );
    console.log("loginButton :", loginButton);
    await loginButton.click();

    // Wait for the home page to load
    // await driver.wait(until.urlContains("https://x.com/home"), 10000);
    await driver.sleep(3000);

    // Find all the trending topic divs
    const trendingTopicDivs = await driver.findElements(
      By.css(
        "div.css-146c3p1.r-bcqeeo.r-1ttztb7.r-qvutc0.r-37j5jr.r-a023e6.r-rjixqe.r-b88u0q.r-1bymd8e"
      )
    );
    console.log("trendingTopicDivs :", trendingTopicDivs);
    const trends = trendingTopicDivs.slice(0, 5);

    // Extract the text from the span elements within each div
    let trendingTopics = [];
    for (const trendDiv of trends) {
      const spanElement = await trendDiv.findElement(
        By.css("span.css-1jxf684.r-bcqeeo.r-1ttztb7.r-qvutc0.r-poiln3")
      );
      const topicText = await spanElement.getText();
      trendingTopics.push(topicText);
    }

    console.log("Trending Topics:", trendingTopics);
    const ipResponse = await axios.get("https://api.ipify.org?format=json", {
      proxy: false,
    });
    const ip = ipResponse.data.ip;

    const record = new Trend({
      id: uuidv4(),
      trends: trendingTopics,
      dateTime: new Date(),
      ip,
    });

    await record.save();
  } catch (error) {
    console.error("Error fetching trends:", error);
  } finally {
    await driver.quit();
  }
}

module.exports = getTrendingTopics;
