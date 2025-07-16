// scripts/scrapeWithCookies.js
import { chromium } from 'playwright';
import { tiktokCookies } from './cookies.js';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  await context.addCookies(tiktokCookies);

  const page = await context.newPage();
  const profileUrl = 'https://www.tiktok.com/@medtools.id'; // replace this if needed
  await page.goto(profileUrl, { waitUntil: 'networkidle' });

  await page.waitForSelector('a[href*="/video/"]');
  const videoLinks = new Set();
  let prevHeight = 0;
  console.log('⏬ Scrolling untuk ambil semua video...');

  while (true) {
    const links = await page.$$eval('a[href*="/video/"]', as => as.map(a => a.href));
    links.forEach(link => videoLinks.add(link));

    const height = await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
      return document.body.scrollHeight;
    });

    if (height === prevHeight) break;
    prevHeight = height;
    await page.waitForTimeout(1500);
  }

  console.log(`🔗 Total link ditemukan: ${videoLinks.size}`);

  const videos = [];

  for (const link of videoLinks) {
    const vid = await browser.newPage();
    try {
      await vid.goto(link, { waitUntil: 'domcontentloaded' });

      const jsonData = await vid.evaluate(() => {
        try {
          return window.__NEXT_DATA__.props.pageProps.itemInfo.itemStruct;
        } catch {
          return null;
        }
      });

      if (!jsonData || !jsonData.createTime) {
        console.warn('❌ Gagal ambil videoData:', link);
        await vid.close();
        continue;
      }

      const time = jsonData.createTime * 1000;
      videos.push({
        url: link,
        uploadDate: new Date(time).toISOString(),
        description: jsonData.desc || '',
        thumbnail: jsonData.cover || ''
      });
    } catch (err) {
      console.warn('❌ Error fetch video:', link, err.message);
    } finally {
      await vid.close();
    }
  }

  console.log('📂 Total video valid:', videos.length);
  videos.forEach((v, i) => {
    console.log(`🎬 [${i + 1}] ${v.uploadDate} — ${v.url}`);
  });

  await browser.close();
})();
