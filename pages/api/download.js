// File: pages/api/download.js

import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { promisify } from 'util';
import { exec } from 'child_process';

const execPromise = promisify(exec);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { links } = req.body;
  if (!Array.isArray(links) || links.length === 0) {
    return res.status(400).json({ error: 'No video links provided' });
  }

  const tmpDir = path.join(process.cwd(), 'tmp');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

  const downloadedFiles = [];

  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    const filename = `video_${i + 1}.mp4`;
    const filepath = path.join(tmpDir, filename);

    try {
      console.log(`🔗 Memproses: ${link}`);
      await execPromise(`yt-dlp -o "${filepath}" "${link}"`);

      const stats = fs.statSync(filepath);
      if (stats.size < 1_000_000) { // less than 1MB dianggap corrupt
        console.warn(`⚠️ File terlalu kecil / corrupt: ${filename} (${stats.size} bytes)`);
        fs.unlinkSync(filepath); // hapus file corrupt
        continue;
      }

      downloadedFiles.push(filepath);
    } catch (err) {
      console.warn(`⚠️ Gagal download: ${link}`, err.message);
    }
  }

  if (downloadedFiles.length === 0) {
    return res.status(500).json({ error: 'Tidak ada video yang berhasil di-download' });
  }

  const zipFilePath = path.join(tmpDir, 'videos.zip');
  const output = fs.createWriteStream(zipFilePath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  archive.pipe(output);
  downloadedFiles.forEach((file) => {
    archive.file(file, { name: path.basename(file) });
  });
  await archive.finalize();

  output.on('close', () => {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="videos.zip"');
    const readStream = fs.createReadStream(zipFilePath);
    readStream.pipe(res);
  });
}
