// scripts/login.js
import { chromium } from 'playwright';
import fs from 'fs';

export async function loginTiktokAndSaveCookies() {
  const browser = await chromium.launch({ headless: false }); // biar bisa login manual
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('🔑 Silakan login TikTok dengan scan QR...');
  await page.goto('https://www.tiktok.com/login/qr', { waitUntil: 'networkidle' });

  // Tunggu sampai user berhasil login (redirect ke homepage)
  await page.waitForURL('https://www.tiktok.com/', { timeout: 120000 });
  console.log('✅ Login berhasil, menyimpan cookies...');

  const cookies = await context.cookies();
  fs.writeFileSync('tiktok-cookies.json', JSON.stringify(cookies, null, 2));
  console.log('🍪 Cookies berhasil disimpan ke tiktok-cookies.json');

  await browser.close();
}

// Jalankan langsung kalau file ini dieksekusi via node
loginTiktokAndSaveCookies();
