// lib/saveSession.js
import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch({ headless: false }); // Buka browser real
  const page = await browser.newPage();
  await page.goto('https://www.tiktok.com/login', { waitUntil: 'networkidle' });

  console.log('🔐 Silakan login secara manual...');
  await page.waitForTimeout(60000); // tunggu 1 menit biar kamu login manual

  const cookies = await page.context().cookies();
  fs.writeFileSync('tiktok-cookies.json', JSON.stringify(cookies, null, 2));

  console.log('✅ Cookies berhasil disimpan ke tiktok-cookies.json');
  await browser.close();
})();
