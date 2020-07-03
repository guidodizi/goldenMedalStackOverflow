import Log from '../models/log.model';
import saveLocalStorage, {
  setLocalStorage,
} from './saveStateWhatsapp';

export default async function run(req, res) {
  const result = await runBot(req.browser).catch(err => {
    console.log(err);
    return res.send({
      started: true,
      err,
    });
  });

  // Fire & Forget
  sendToWhatsapp(req.browser, result).then(async () => {
    await req.browser.close();
  });
  return res.send({ started: true });
}

async function runBot(browser) {
  const page = await browser.newPage();

  await page.setUserAgent(process.env.USER_AGENT);

  await page.goto(
    `https://stackoverflow.com/users${encodeURI(
      process.env.SO_USER,
    )}`,
    {
      waitUntil: 'networkidle2',
    },
  );

  const login1 = await page.$('a.login-link');
  const login2 = await page.$(
    'body > div.topbar._old > div.network-items > div.login-links-container > a:nth-child(2)',
  );

  if (login1) {
    await runLogin(page, login1).catch(async err => {
      console.log(err);
      return "Couldn't log in";
    });
  } else if (login2) {
    await runLogin(page, login2).catch(async err => {
      console.log(err);
      return "Couldn't log in";
    });
  } else {
    return "Can't find log in on StackOverflow. Robot detected";
  }

  const [badge, result] = await page
    .evaluate(() => {
      const badge = document.querySelector(
        '#badge-card-next > div > div:nth-child(2)',
      );
      const result = document.querySelector(
        '#top-cards > aside > div > div > div > div:nth-child(2) > div > div > span',
      );

      const badge2 = document.querySelector(
        'body > main > div:nth-child(3) > div > div > div > div > div > span',
      );
      const result2 = document.querySelector(
        'body > main > div:nth-child(3) > div > div > div > h4 > span',
      );

      if (badge && result) return [badge.innerHTML, result.innerHTML];
      if (badge2 && result2)
        return [badge2.innerHTML, result2.innerHTML];
    })
    .catch(async err => {
      console.log(err);
      return "Couldn't find results on StackOverflow's page";
    });

  if (badge === 'Fanatic') {
    const log = new Log({ progress: result });

    await log.save();
    return `StackOverflow result: ${result}`;
  }

  return `StackOverflow tracked badge is not Fanatic`;
}

async function runLogin(page, login) {
  console.log('RUN LOGIN');
  await login.click();
  await page.waitForSelector(
    '#openid-buttons > button.grid--cell.s-btn.s-btn__icon.s-btn__google.bar-md.ba.bc-black-3',
  );

  await page.type('#email', process.env.USERNAME, { delay: 100 });
  await page.type('#password', process.env.PASSWORD, {
    delay: 100,
  });
  await page.click('#submit-button');

  await page.waitFor(3000);
}

async function sendToWhatsapp(browser, result) {
  const page = await browser.newPage();

  await page.setUserAgent(process.env.USER_AGENT);

  await setLocalStorage(browser);

  await page.waitFor(3000);

  // send message now that local storage is hydrated
  await page.goto(
    `https://wa.me/${encodeURI(process.env.PHONE)}?text=${encodeURI(
      result,
    )}`,
    {
      waitUntil: 'networkidle2',
    },
  );

  await page.click('#action-button');
  await page.waitFor(3000);

  await page.click('#fallback_block > div > div > a');
  await page.waitFor(3000);

  await saveLocalStorage(page);
  await page.waitFor(3000);

  // wait for send button to click
  await page
    .waitForSelector(
      '#main > footer > div > div:nth-child(3) > button > span',
      {
        timeout: 180000,
      },
    )
    .catch(async err => {
      console.log(err);
      // if fails to find it, try to send by pressing enter
      await page
        .click(
          '#main > footer > div > div:nth-child(2) > div > div:nth-child(2)',
        )
        .catch(err => {
          throw err;
        });
      await page.keyboard.press('Enter');
      await page.waitFor(3000);
      await browser.close();
      throw Error('done');
    });
  await page.waitFor(3000);
  await page.click(
    '#main > footer > div > div:nth-child(3) > button > span',
  );
  await page.waitFor(3000);
}
