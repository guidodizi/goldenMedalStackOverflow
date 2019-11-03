const puppeteer = require("puppeteer");

async function browserMiddleware(req, res, next) {
  const browser = await puppeteer.launch({headless: (process.env.HEADLESS === 'true'), args: ['--no-sandbox', '--disable-setuid-sandbox']});
  req.browser = browser;
  next();
}

module.exports = {
  browserMiddleware
}
