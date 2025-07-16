const { chromium } = require('playwright');
const fs = require('fs');

async function scrapeTiktokProfile(username, startDate, endDate) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  // Coba load cookies kalau ada
  if (fs.existsSync('tiktok-cookies.json')) {
    const cookies = JSON.parse(fs.readFileSync('tiktok-cookies.json'));
    await context.addCookies(cookies);
    console.log('🍪 Cookies loaded!');
  }

  const page = await context.newPage();
  const profileUrl = `https://www.tiktok.com/@${username}`;

  try {
    await page.goto(profileUrl, { waitUntil: 'networkidle' });

    await page.waitForSelector('h1');
    const usernameText = await page.$eval('h1', el => el.innerText);
    const avatar = await page.$eval('img[src*="tiktok"]', img => img.src);

    const videoLinks = new Set();
    let prevHeight = 0;

    while (true) {
      const links = await page.$$eval('a[href*="/video/"]', as =>
        as.map(a => a.href)
      );
      links.forEach(link => videoLinks.add(link));

      const height = await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
        return document.body.scrollHeight;
      });

      if (height === prevHeight) break;
      prevHeight = height;
      await page.waitForTimeout(3000);
    }

    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const videos = [];

    console.log(`🔗 Total link ditemukan: ${videoLinks.size}`);

    for (const link of videoLinks) {
      const vid = await context.newPage();
      try {
        await vid.goto(link, { waitUntil: 'domcontentloaded' });

        const jsonData = await vid.evaluate(() => {
          const script = [...document.querySelectorAll('script')]
            .find(s => s.textContent.includes('__UNIVERSAL_DATA__'));
          if (!script) return null;

          const match = script.textContent.match(/window\.__UNIVERSAL_DATA__\s*=\s*({.*});/);
          if (!match) return null;

          const data = JSON.parse(match[1]);
          return data?.SEOState?.itemList?.[0] || null;
        });

        if (!jsonData || !jsonData.createTime) {
          console.warn('❌ Gagal ambil videoData:', link);
          await vid.close();
          continue;
        }

        const time = jsonData.createTime * 1000;
        if (time >= start && time <= end) {
          videos.push({
            url: link,
            uploadDate: new Date(time).toISOString(),
            description: jsonData.desc || '',
            thumbnail: jsonData.cover || '',
          });
        }
      } catch (err) {
        console.warn('❌ Error fetch video:', link, err.message);
      } finally {
        await vid.close();
      }
    }

    await browser.close();

    console.log(`📂 Total video valid: ${videos.length}`);
    videos.forEach((v, i) => {
      console.log(`🎬 [${i + 1}] ${v.uploadDate} — ${v.url}`);
    });

    return {
      username: usernameText,
      avatar,
      total: videos.length,
      estSize: `${videos.length * 5} MB`,
      videos,
    };

  } catch (err) {
    await browser.close();
    console.error('❌ Scraper error:', err.message);
    throw new Error('Gagal mengambil data dari TikTok');
  }
}

module.exports = { scrapeTiktokProfile };
