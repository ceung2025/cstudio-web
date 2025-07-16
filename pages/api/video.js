import { chromium } from 'playwright';

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url || !url.includes('/video/')) {
    return res.status(400).json({ error: 'Link video TikTok tidak valid' });
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const jsonData = await page.evaluate(() => {
      const script = [...document.querySelectorAll('script')]
        .find(s => s.textContent.includes('__UNIVERSAL_DATA__'));
      if (!script) return null;

      const text = script.textContent;
      const match = text.match(/window\.__UNIVERSAL_DATA__\s*=\s*({.*});/);
      if (!match) return null;

      const data = JSON.parse(match[1]);
      return data?.SEOState?.itemList?.[0] || null;
    });

    if (!jsonData || !jsonData.createTime) {
      throw new Error('Gagal ambil videoData');
    }

    const time = jsonData.createTime * 1000;

    return res.status(200).json({
      url,
      uploadDate: new Date(time).toISOString(),
      description: jsonData.desc || '',
      thumbnail: jsonData.cover || '',
    });

  } catch (err) {
    console.error('❌ Scraper video error:', err.message);
    res.status(500).json({ error: 'Gagal ambil video dari link' });
  } finally {
    await browser.close();
  }
}
