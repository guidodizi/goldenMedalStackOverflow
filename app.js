const puppeteer = require("puppeteer");
require("dotenv").config();
const randomUseragent = require("random-useragent");

const cookies = require("./cookies");
const localStorage = require("./localStorage");

puppeteer
  .launch({
    headless: false,
    args: ["--no-sandbox"]
  })
  .then(browser => {
    const sendToWhatsapp = async result => {
      const page = await browser.newPage();
      await page.setUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36"
      );
      cookies.forEach(async cookie => await page.setCookie(cookie));

      await page.goto(`https://web.whatsapp.com`, { waitUntil: "networkidle2" });

      await page.evaluate(initLocalStorage => {
        initLocalStorage.forEach(elem => {
          console.log(elem);
          localStorage.setItem(elem.key, JSON.stringify(elem.value));
        });
      }, localStorage);

      await page.waitFor(3000);

      await page.goto(`https://wa.me/59894388685?text=${encodeURI(result)}`, {
        waitUntil: "networkidle2"
      });

      await page.click("#action-button");

      await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 90000 });

      await page.click("#main > footer > div > div:nth-child(3) > button > span").catch(async err => {
        console.log(err);
        await page.click('#main > footer > div > div:nth-child(2) > div > div');
        await page.type(String.fromCharCode(13));
      });
    };

    const main = async () => {
      const runLogin = async login => {
        console.log("RUN LOGIN");
        await login.click();
        await page.waitForSelector(
          "#openid-buttons > button.grid--cell.s-btn.s-btn__icon.s-btn__google.bar-md.ba.bc-black-3"
        );

        const googleLogin = await page.$(
          "#openid-buttons > button.grid--cell.s-btn.s-btn__icon.s-btn__google.bar-md.ba.bc-black-3"
        );
        await googleLogin.click();
        await page.waitForNavigation({ waitUntil: "networkidle2" });

        const i1 = await page.$("#Email");
        const i2 = await page.$("#identifierId");

        if (i1) {
          await page.type("#Email", process.env.USERNAME, { delay: 100 });
          await page.click("#next");

          await page.waitForSelector("#Passwd");
          await page.type("#Passwd", process.env.PASSWORD, { delay: 100 });
          await page.click("#signIn");
        } else if (i2) {
          await page.type("#identifierId", process.env.USERNAME, { delay: 100 });
          await page.click("#identifierNext > span > span");

          await page.waitForSelector("#password > div > div > div > input");
          await page.waitFor(5000);
          await page.type("#password > div > div > div > input", process.env.PASSWORD, {
            delay: 100
          });
          await page.click("#passwordNext > span > span");
        } else {
          throw Error("Cant find google login input");
        }
        await page.waitFor(8000);
      };
      const page = await browser.newPage();
      await page.setUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36"
      );
      cookies.forEach(async cookie => await page.setCookie(cookie));

      await page.goto("https://stackoverflow.com/users/7037861/guido-dizioli", {
        waitUntil: "networkidle2"
      });

      const login1 = await page.$(
        "body > header > div > ol.-secondary.js-secondary-topbar-links.drop-icons-responsively.user-logged-out.the-js-is-handling-responsiveness > li.-ctas > a.login-link.s-btn.btn-topbar-clear.py8.js-gps-track"
      );
      const login2 = await page.$("body > div.topbar._old > div.network-items > div.login-links-container > a:nth-child(2)");

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
    main().catch(err => {
      console.log(err);
      sendToWhatsapp(err.message).catch(err => console.log(err));
    });
  });

