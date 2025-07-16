// pages/batch.js
import { useState } from 'react';

export default function BatchDownload() {
  const [urls, setUrls] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDownloadUrl(null);

    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ links: urls.split('\n').map(u => u.trim()).filter(Boolean) })
      });

      if (!res.ok) throw new Error('Gagal membuat ZIP. Coba lagi.');

      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      setDownloadUrl(href);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">TikTok Batch Downloader</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea
          rows={10}
          className="w-full border rounded p-3"
          placeholder="Paste TikTok video links (1 per line)"
          value={urls}
          onChange={e => setUrls(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Download ZIP'}
        </button>
      </form>

      {downloadUrl && (
        <div className="mt-4">
          <a
            href={downloadUrl}
            download="tiktok-videos.zip"
            className="text-green-600 underline"
          >
            🎉 Click here to download your ZIP
          </a>
        </div>
      )}

      {error && (
        <p className="mt-4 text-red-600">❌ {error}</p>
      )}
    </div>
  );
}
