// scripts/scrapeSingleVideo.js
import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';
import JSZip from 'jszip';
import fetch from 'node-fetch';

// List link video TikTok (bisa kamu replace pakai input user nanti)
const videoLinks = [
  'https://www.tiktok.com/@medtools.id/video/7259392776768052481',
  'https://www.tiktok.com/@medtools.id/video/7262758434569259010'
];

async function getVideoData(page, link) {
  try {
    await page.goto(link, { waitUntil: 'domcontentloaded' });
    const result = await page.evaluate(() => {
      const script = [...document.querySelectorAll('script')].find(s => s.textContent.includes('__UNIVERSAL_DATA__'));
      if (!script) return null;
      const match = script.textContent.match(/window\.__UNIVERSAL_DATA__\s*=\s*({.*});/);
      if (!match) return null;
      const data = JSON.parse(match[1]);
      const info = data?.SEOState?.itemList?.[0];
      return {
        url: info?.video?.playAddr,
        desc: info?.desc,
        id: info?.id,
        cover: info?.cover
      };
    });
    return result;
  } catch (e) {
    console.warn('❌ Gagal ambil data dari:', link);
    return null;
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const zip = new JSZip();

  for (let i = 0; i < videoLinks.length; i++) {
    const link = videoLinks[i];
    console.log(`🎬 Scraping video ${i + 1}...`);
    const data = await getVideoData(page, link);

    if (!data?.url) continue;
    const buffer = await fetch(data.url).then(res => res.arrayBuffer());
    const filename = `${data.id || 'video_' + i}.mp4`;

    zip.file(filename, buffer);
    console.log(`✅ ${filename} ditambahkan ke ZIP`);
  }

  const zipPath = path.resolve('./downloads/tiktok_videos.zip');
  const content = await zip.generateAsync({ type: 'nodebuffer' });

  fs.mkdirSync('./downloads', { recursive: true });
  fs.writeFileSync(zipPath, content);

  console.log(`📦 ZIP selesai disimpan di: ${zipPath}`);
  await browser.close();
})();
