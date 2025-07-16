const { scrapeTiktokProfile } = require('@/lib/scrapeTiktok');

export default async function handler(req, res) {
  const { url, startDate, endDate } = req.query;

  if (!url || !startDate || !endDate) {
    return res.status(400).json({ error: 'Semua parameter (url, startDate, endDate) wajib diisi!' });
  }

  const match = url.match(/tiktok\.com\/@([\w.-]+)/);
  if (!match) {
    return res.status(400).json({ error: 'Link TikTok tidak valid! Format harus seperti https://www.tiktok.com/@username' });
  }

  const username = match[1];
  console.log('📥 Request received with params:', { url, startDate, endDate });
  console.log('🔍 Username extracted:', username);

  try {
    const data = await scrapeTiktokProfile(username, startDate, endDate);
    console.log('✅ Data berhasil diambil:', {
      username: data.username,
      total: data.total,
      estSize: data.estSize,
    });
    res.status(200).json(data);
  } catch (err) {
    console.error('❌ Scraper error:', err.message);
    res.status(500).json({ error: 'Gagal fetch data dari TikTok, coba beberapa saat lagi' });
  }
}
