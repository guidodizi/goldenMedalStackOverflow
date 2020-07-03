import Whatsapp from '../models/whatsapp.model';

export default async function saveStateWhatsapp(req, res) {
  try {
    const page = await req.browser.newPage();

    await page.setUserAgent(process.env.USER_AGENT);

    await setLocalStorage(req.browser);
    await page.waitFor(3000);

    await page.goto(`https://web.whatsapp.com`, {
      waitUntil: 'networkidle2',
    });
    await page.waitFor(3000);

    await saveLocalStorage(page);
    return res.send({ saved: true });
  } catch (err) {
    return res.send({
      saved: false,
      error: err,
    });
  }
}

export async function setLocalStorage(browser) {
  const page = await browser.newPage();

  await page.setUserAgent(process.env.USER_AGENT);
  await page.goto(`https://web.whatsapp.com`, {
    waitUntil: 'networkidle2',
  });

  const last = await Whatsapp.findOne()
    .sort({ createdAt: -1 })
    .exec();

  // set local storage for Whatsapp
  await page.evaluate(last => {
    Object.keys(last).map(key => {
      localStorage.setItem(key, last[key]);
    });
  }, last.localStorage);

  await page.close();
}

async function saveLocalStorage(page) {
  const localStorage = await page.evaluate(() => ({
    ...window.localStorage,
  }));

  const whatsapp = new Whatsapp({ localStorage });

  await whatsapp.save();
}
