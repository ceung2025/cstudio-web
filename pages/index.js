import Head from 'next/head';
import { useState } from 'react';

export default function Home() {
  const [link, setLink] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#00b3ff] to-[#063f96] text-white p-6 font-poppins">
      <Head>
        <title>CStudio TikTok Downloader</title>
        <meta name="description" content="Download TikTok videos by profile & date" />
      </Head>

      <div className="max-w-4xl mx-auto bg-white text-black p-6 rounded-2xl shadow-2xl">
        <h1 className="text-2xl font-bold mb-4">Insert TikTok Profile Link</h1>
        <input
          type="text"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://www.tiktok.com/@username"
          className="w-full border border-gray-300 rounded-lg p-2 mb-4"
        />

        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="block mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>
          <div className="flex-1">
            <label className="block mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg mb-4">
          <p className="font-semibold">Preview:</p>
          <ul className="list-disc pl-5 text-sm text-gray-700">
            <li>Profile: PejuangFK</li>
            <li>Total Videos: 24</li>
            <li>Estimated Size: 512 MB</li>
          </ul>
        </div>

        <button className="bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition">
          Download ZIP
        </button>
      </div>
    </div>
  );
}