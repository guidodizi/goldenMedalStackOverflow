import puppeteer from 'puppeteer';

export async function browserMiddleware(req, res, next) {
  const browser = await puppeteer.launch({
    headless: process.env.HEADLESS === 'true',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  req.browser = browser;
  next();
}
