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
  const proxy = `http://${env.proxy_username}:${env.proxy_password}@${env.proxy_host}:${env.proxy_port}`;
  const options = new chrome.Options();
  options.addArguments(`--proxy-server=${proxy}`);

  chromeCapabilities.set("goog:chromeOptions", {
    args: ["--headless", "--disable-gpu"],
  });

  const driver = new Builder()
    .forBrowser(Browser.CHROME)
    .setChromeOptions(chromeCapabilities)
    .build();
  // .setChromeOptions(options)

  try {
    await driver.get("https://x.com/i/flow/login");
    // Twitter Login
    const usernameInput = await driver.wait(
      until.elementLocated(By.css('input[name="text"]')),
      20000
    );
    await usernameInput.sendKeys(env.TWITTER_USERNAME);

    const nextButton = await driver.findElement(
      By.xpath("//span[text()='Next']/ancestor::button")
    );
    await nextButton.click();

    const passwordInput = await driver.wait(
      until.elementLocated(By.css('input[name="password"]')),
      20000
    );
    await passwordInput.sendKeys(env.TWITTER_PASSWORD);

    const loginButton = await driver.wait(
      until.elementLocated(
        By.css('button[data-testid="LoginForm_Login_Button"]')
      ),
      20000
    );
    await loginButton.click();

    // Wait for the home page to load
    // await driver.wait(until.urlContains("https://x.com/home"), 10000);
    await driver.sleep(5000);

    // Find all the trending topic divs
    const trendingTopicDivs = await driver.findElements(
      By.css(
        "div.css-146c3p1.r-bcqeeo.r-1ttztb7.r-qvutc0.r-37j5jr.r-a023e6.r-rjixqe.r-b88u0q.r-1bymd8e"
      )
    );
    console.log("trendin Tpics :",trendingTopicDivs);
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
