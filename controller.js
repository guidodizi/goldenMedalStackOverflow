const puppeteer = require("puppeteer");
require("dotenv").config();

const cookies = JSON.parse(process.env.COOKIES);
const localStorage = JSON.parse(process.env.WA_LOCAL_STORAGE);

const run = async (req, res) => {
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox'] });

  const sendToWhatsapp = async result => {
    const page = await browser.newPage();
    await page.setUserAgent(process.env.USER_AGENT);
    cookies.forEach(async cookie => await page.setCookie(cookie));

    await page.goto(`https://web.whatsapp.com`, { waitUntil: "networkidle2" });

    await page.evaluate(initLocalStorage => {
      initLocalStorage.forEach(elem => {
        console.log(elem);
        localStorage.setItem(elem.key, JSON.stringify(elem.value));
      });
    }, localStorage);

    await page.waitFor(3000);

    await page.goto(`https://wa.me/${encodeURI(process.env.PHONE)}?text=${encodeURI(result)}`, {
      waitUntil: "networkidle2"
    });

    await page.click("#action-button");

    await page.waitForSelector("#main > footer > div > div:nth-child(3) > button > span", {
      timeout: 90000
    });
    await page.waitFor(3000);
    await page.click("#main > footer > div > div:nth-child(3) > button > span");
    const message = await page.$(
      "#main > footer > div > div:nth-child(2) > div > div:nth-child(2)"
    );
    if (message.innerHTML) {
      console.log("enter");
      await page.click("#main > footer > div > div:nth-child(2) > div > div:nth-child(2)");
      await page.type(String.fromCharCode(13));
    }
    await page.waitFor(8000);
  };

  const main = async () => {
    const runLogin = async login => {
      console.log("RUN LOGIN");
      await login.click();
      await page.waitForSelector(
        "#openid-buttons > button.grid--cell.s-btn.s-btn__icon.s-btn__google.bar-md.ba.bc-black-3"
      );

        await page.type("#email", process.env.USERNAME, { delay: 100 });
        await page.type("#password", process.env.PASSWORD, { delay: 100 });
        await page.click('#submit-button');
      // const googleLogin = await page.$(
      //   "#openid-buttons > button.grid--cell.s-btn.s-btn__icon.s-btn__google.bar-md.ba.bc-black-3"
      // );
      // await googleLogin.click();
      // await page.waitForNavigation({ waitUntil: "networkidle2" });

      // const i1 = await page.$("#Email");
      // const i2 = await page.$("#identifierId");

      // if (i1) {
      //   await page.type("#Email", process.env.USERNAME, { delay: 100 });
      //   await page.click("#next");

      //   await page.waitForSelector("#Passwd");
      //   await page.type("#Passwd", process.env.PASSWORD, { delay: 100 });
      //   await page.click("#signIn");
      // } else if (i2) {
      //   await page.type("#identifierId", process.env.USERNAME, { delay: 100 });
      //   await page.click("#identifierNext > span > span");

      //   await page.waitForSelector("#password > div > div > div > input");
      //   await page.waitFor(5000);
      //   await page.type("#password > div > div > div > input", process.env.PASSWORD, {
      //     delay: 100
      //   });
      //   await page.click("#passwordNext > span > span");
      // } else {
      //   throw Error("Cant find google login input");
      // }
      await page.waitFor(8000);
    };
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36"
    );
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
      await runLogin(login1).catch(err => {
        console.log(err);
        throw new Error("Couldn't log in");
      });
    } else if (login2) {
      await runLogin(login2).catch(err => {
        console.log(err);
        throw new Error("Couldn't log in");
      });
    } else {
      throw new Error("Can't find log in on StackOverflow. Robot detected");
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
      .catch(err => {
        console.log(err);
        throw new Error("Couldn't find results on StackOverflow's page");
      });

    if (badge === "Fanatic") {
      await sendToWhatsapp(`StackOverflow result: ${result}`);
    } else {
      throw new Error(`StackOverflow tracked badge is not Fanatic`);
    }
    await browser.close();
  };

  main()
    .then(() => {
      res.write(JSON.stringify({ done: true }));
      return res.end();
    })
    .catch(err => {
      console.log(err);
      sendToWhatsapp(err.message)
        .then(() => {
          res.write(JSON.stringify({ err, done: false }));
          return res.end();
        })
        .catch(err => {
          console.log(err);
          res.write(JSON.stringify({ err, done: false }));
          return res.end();
        });
    });
};
module.exports = { run };
