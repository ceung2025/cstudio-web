import Head from 'next/head';
import { useState } from 'react';
import { FaSearch, FaCalendarAlt } from 'react-icons/fa';

export default function Home() {
  const [link, setLink] = useState('');
  const [profileName, setProfileName] = useState('');
  const [totalVideos, setTotalVideos] = useState('');
  const [estimatedSize, setEstimatedSize] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [batchLinks, setBatchLinks] = useState('');
  const [batchLoading, setBatchLoading] = useState(false);

  const handlePreview = async () => {
    if (!/^https:\/\/www\.tiktok\.com\/@/.test(link)) {
      setError('Tolong masukkan link TikTok yang valid!');
      return;
    }
    if (!startDate || !endDate) {
      setError('Masukkan tanggal awal dan akhir!');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `/api/preview?url=${encodeURIComponent(link)}&startDate=${startDate}&endDate=${endDate}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengambil data');

      setProfileName(data.username || '');
      setTotalVideos(data.videos?.length || 0);
      setEstimatedSize(`${(data.videos?.length || 0) * 5} MB`);
      setPreview(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchDownload = async () => {
    const links = batchLinks
      .split('\n')
      .map((link) => link.trim())
      .filter((link) => link.startsWith('http'));

    if (links.length === 0) return alert('Masukkan minimal 1 link TikTok');

    setBatchLoading(true);
    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ links }),
      });

      if (!res.ok) throw new Error('Gagal download');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'videos.zip';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Gagal download video');
    } finally {
      setBatchLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>CSTUDIO | Medtools</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/medtools-logo.png" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-sky-400 to-blue-900 text-gray-900 flex flex-col items-center justify-center p-6 font-poppins">
        {/* Logo */}
        <div className="w-full flex justify-end items-center px-4">
          <img src="/medtools-logo.png" alt="Medtools Logo" className="w-16 h-16" />
        </div>

        {/* Hero */}
        <div className="mt-[-5rem] text-center">
          <h1 className="text-white text-[6rem] font-extrabold tracking-wide leading-none">
            CSTUDIO
          </h1>
          <p className="text-white mt-2 text-lg font-semibold">
            Unstoppable Creativity | <span className="font-bold">FYP FYP FYP</span>
          </p>
          <p className="text-white text-sm mt-1">
            Paste your profile link and download your content ✨
          </p>
        </div>

        {/* Search Bar */}
        <div className="mt-6 w-full max-w-3xl">
          <div className="flex items-center bg-white rounded-full px-6 py-3 shadow-md">
            <FaSearch className="text-blue-600 mr-4" />
            <input
              type="text"
              placeholder="Insert Your TikTok Profile Link..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="flex-1 outline-none text-gray-700 placeholder-gray-400"
            />
            <button
              onClick={handlePreview}
              disabled={loading}
              className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 transition duration-200"
            >
              {loading ? 'Loading…' : 'Preview'}
            </button>
          </div>
          {error && <p className="text-red-200 mt-2">{error}</p>}
        </div>

        {/* Batch Input Area */}
        <div className="mt-8 max-w-3xl w-full">
          <textarea
            rows={4}
            value={batchLinks}
            onChange={(e) => setBatchLinks(e.target.value)}
            placeholder="Paste multiple TikTok video links (satu per baris)..."
            className="w-full p-4 rounded-lg shadow-md border border-gray-300 focus:outline-none resize-none"
          ></textarea>
          <button
            onClick={handleBatchDownload}
            disabled={batchLoading}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 transition duration-200"
          >
            {batchLoading ? 'Downloading…' : 'Download Batch'}
          </button>
        </div>

        {/* Preview Info */}
        {preview && (
          <div className="mt-6 bg-white rounded-xl p-6 shadow-lg max-w-xl w-full">
            <div className="flex items-center gap-4">
              <img src={preview.avatar} alt="avatar" className="w-16 h-16 rounded-full" />
              <div>
                <h2 className="text-xl font-bold">@{preview.username}</h2>
                <p>{preview.nickname || '-'}</p>
              </div>
            </div>
            <ul className="mt-4 text-sm text-gray-800">
              <li>🎬 Total Videos: {preview.videos?.length}</li>
              <li>📦 Estimated Size: {(preview.videos?.length || 0) * 5} MB</li>
            </ul>

            <div className="mt-4 grid grid-cols-2 gap-4">
              {preview.videos?.map((vid, idx) => (
                <div key={idx} className="border rounded-lg overflow-hidden bg-gray-100 shadow">
                  <img src={vid.thumbnail} alt={`Video ${idx + 1}`} className="w-full h-40 object-cover" />
                  <div className="p-2 text-sm">
                    <p className="truncate">{vid.description}</p>
                    <p className="text-gray-500">{new Date(vid.uploadDate).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Form */}
        <div className="mt-10 bg-blue-50 rounded-3xl p-8 flex flex-col lg:flex-row gap-6 max-w-4xl w-full shadow-lg">
          <div className="flex-1 space-y-4">
            <div className="flex items-center">
              <span className="font-semibold text-gray-700 w-40">Profile Name:</span>
              <input type="text" value={profileName} readOnly className="flex-1 px-4 py-2 rounded-md border border-gray-300 bg-gray-100 focus:outline-none" />
            </div>
            <div className="flex items-center">
              <span className="font-semibold text-gray-700 w-40">Total Video:</span>
              <input type="text" value={totalVideos} readOnly className="flex-1 px-4 py-2 rounded-md border border-gray-300 bg-gray-100 focus:outline-none" />
            </div>
            <div className="flex items-center">
              <span className="font-semibold text-gray-700 w-40">Estimated Size:</span>
              <input type="text" value={estimatedSize} readOnly className="flex-1 px-4 py-2 rounded-md border border-gray-300 bg-gray-100 focus:outline-none" />
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex items-center">
              <span className="font-semibold text-gray-700 w-28">Start Date:</span>
              <div className="relative w-full">
                <FaCalendarAlt className="absolute top-3 left-3 text-gray-500" />
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none" />
              </div>
            </div>
            <div className="flex items-center">
              <span className="font-semibold text-gray-700 w-28">End Date:</span>
              <div className="relative w-full">
                <FaCalendarAlt className="absolute top-3 left-3 text-gray-500" />
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none" />
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={handlePreview}
                className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-full hover:bg-blue-700 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 transition duration-200"
              >
                Download
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-white text-xs mt-12">
          Powered by <span className="font-bold">Gilang</span>, Medtools Creative Team
        </p>
      </div>
    </>
  );
}
