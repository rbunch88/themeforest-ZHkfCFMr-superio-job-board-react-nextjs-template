// superio/tests/auth.spec.js
// Simple Puppeteer test for login flow

import 'dotenv/config';
import puppeteer from 'puppeteer';

(async () => {
  const target = process.env.TARGET_URL || 'http://localhost:3000';
  const email = process.env.TEST_EMAIL || 'test@example.com';
  const password = process.env.TEST_PASSWORD || 'hunter2';

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(`${target}/login`, { waitUntil: 'networkidle2' });

  // Fill login form
  await page.type('input[name="email"]', email);
  await page.type('input[name="password"]', password);
  await page.click('button[type="submit"]');

  // Wait for redirect
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  console.log('Final URL after login:', page.url());

  await browser.close();
})();
