const puppeteer = require("puppeteer");
const moment = require("moment");
require("dotenv").config();

const cookies = JSON.parse(process.env.COOKIES);
const localStorage = JSON.parse(process.env.WA_LOCAL_STORAGE);
const Log = require('./log.model');

async function sendToWhatsapp(browser, result) {
  const page = await browser.newPage();
  await page.setUserAgent(process.env.USER_AGENT);
  cookies.forEach(async cookie => await page.setCookie(cookie));

  await page.goto(`https://web.whatsapp.com`, {waitUntil: "networkidle2"});

  // set local storage for Whatsapp
  await page.evaluate(initLocalStorage => {
    initLocalStorage.forEach(elem => {
      console.log(elem);
      localStorage.setItem(elem.key, JSON.stringify(elem.value));
    });
  }, localStorage);

  await page.waitFor(3000);

  // send message now that local storage is hydrated
  await page.goto(`https://wa.me/${encodeURI(process.env.PHONE)}?text=${encodeURI(result)}`, {
    waitUntil: "networkidle2"
  });

  await page.click("#action-button");

  await page.waitFor(3000);

  await page.click('#content > div > div > div > a');

  // wait for send button to click
  await page.waitForSelector("#main > footer > div > div:nth-child(3) > button > span", {
    timeout: 180000
  }).catch(async (err) => {
    console.log(err);
    // if fails to find it, try to send by pressing enter
    await page.click("#main > footer > div > div:nth-child(2) > div > div:nth-child(2)").catch(err => {
      throw err;
    });
    await page.keyboard.press('Enter');
    await page.waitFor(3000);
    await browser.close()
    throw Error('done')
  });
  await page.waitFor(3000);
  await page.click("#main > footer > div > div:nth-child(3) > button > span");
  await page.waitFor(3000);
};

async function runBot(){
  const browser = await puppeteer.launch({headless: false, args: ['--no-sandbox', '--disable-setuid-sandbox']});

  const runLogin = async login => {
    console.log("RUN LOGIN");
    await login.click();
    await page.waitForSelector(
      "#openid-buttons > button.grid--cell.s-btn.s-btn__icon.s-btn__google.bar-md.ba.bc-black-3"
    );

    await page.type("#email", process.env.USERNAME, {delay: 100});
    await page.type("#password", process.env.PASSWORD, {delay: 100});
    await page.click('#submit-button');

    await page.waitFor(3000);
  };

  const page = await browser.newPage();
  await page.setUserAgent(process.env.USER_AGENT);

  cookies.forEach(async cookie => await page.setCookie(cookie));

  await page.goto(`https://stackoverflow.com/users${encodeURI(process.env.SO_USER)}`, {
    waitUntil: "networkidle2"
  });

  const login1 = await page.$(
    "body > header > div > ol.-secondary.js-secondary-topbar-links.drop-icons-responsively.user-logged-out.the-js-is-handling-responsiveness > li.-ctas > a.login-link.s-btn.btn-topbar-clear.py8.js-gps-track"
  );
  const login2 = await page.$(
    "body > div.topbar._old > div.network-items > div.login-links-container > a:nth-child(2)"
  );

  if (login1) {
    await runLogin(login1).catch(async (err) => {
      console.log(err);
      await sendToWhatsapp(browser, "Couldn't log in");
    });
  } else if (login2) {
    await runLogin(login2).catch(async (err) => {
      console.log(err);
      await sendToWhatsapp(browser, "Couldn't log in");
    });
  } else {
    await sendToWhatsapp(browser, "Can't find log in on StackOverflow. Robot detected");
  }

  const [badge, result] = await page
    .evaluate(() => {
      const badge = document.querySelector("#badge-card-next > div > div:nth-child(2)");
      const result = document.querySelector(
        "#top-cards > aside > div > div > div > div:nth-child(2) > div > div > span"
      );

      const badge2 = document.querySelector(
        "body > main > div:nth-child(3) > div > div > div > div > div > span"
      );
      const result2 = document.querySelector(
        "body > main > div:nth-child(3) > div > div > div > h4 > span"
      );

      if (badge && result) return [badge.innerHTML, result.innerHTML];
      else if (badge2 && result2) return [badge2.innerHTML, result2.innerHTML];
    })
    .catch(async (err) => {
      console.log(err);
      await sendToWhatsapp(browser, "Couldn't find results on StackOverflow's page");
    });

  if (badge === "Fanatic") {
    const log = new Log({ progress: result });
    await log.save();
    await sendToWhatsapp(browser, `StackOverflow result: ${result}`);
  } else {
    await sendToWhatsapp(browser, `StackOverflow tracked badge is not Fanatic`);
  }
  await browser.close();
};

async function run(req, res) {
  // fire and forget
  runBot()
    .catch(err => {
      console.log(err);
      return res.send({started: true, err})
    });
  return res.send({started: true})
}

async function check(req, res) {
  const log = await Log.findOne({
    createdAt: moment().format('YYYY-MM-DD')
  });

  return res.send({done: !!log})
}

module.exports = {
  run,
  check
}
