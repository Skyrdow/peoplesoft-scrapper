import { Builder, By } from "selenium-webdriver";
import { configDotenv } from "dotenv";

configDotenv();

const url = process.env.url;
const password = process.env.password;

if (url === undefined)
  console.log("sin url")

const checkWebsite = async (url) => {
  // Setup
  const driver = new Builder().forBrowser("chrome").build();
  driver.manage().window().maximize();
  await driver.get(url);

  // console.log(await driver.getPageSource())

  const element = await driver.findElement(By.css(
    ".text-secondary-content.md\\:text-5xl"
  ))

  const text = await element.getText()

  console.log(text)

  await driver.quit();
  // await driver.sleep(5000);
};

checkWebsite(url);
