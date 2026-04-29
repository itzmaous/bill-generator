// screenshot.js — dùng Puppeteer render HTML -> Buffer PNG
const puppeteer = require('puppeteer');
const { buildReceiptHTML } = require('./receipt');

let browser = null;

async function getBrowser() {
  if (!browser || !browser.connected) {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }
  return browser;
}

async function renderBill(bill) {
  const html = buildReceiptHTML(bill);
  const b = await getBrowser();
  const page = await b.newPage();
  try {
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 15000 });
    await page.setViewport({
      width: 1200,
      height: 4600,
      deviceScaleFactor: 3
    });

    const el = await page.$('.receipt');
    const buf = await el.screenshot({ type: 'png' });
    return buf;
  } finally {
    await page.close();
  }
}

module.exports = { renderBill };
