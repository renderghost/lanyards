'use client';

import { useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeButtonProps {
  url: string;
  handle: string;
}

export default function QRCodeButton({ url, handle }: QRCodeButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');

  const generateQRCode = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      setQrCodeDataUrl(dataUrl);
      setShowModal(true);
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  };

  return (
    <>
      <button
        onClick={generateQRCode}
        className="w-full bg-gray-100 text-gray-900 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
      >
        View as QR Code
      </button>

      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4 text-center">Share</h3>
            <div className="flex justify-center mb-4">
              {qrCodeDataUrl && (
                <img
                  src={qrCodeDataUrl}
                  alt={`QR Code for ${handle}`}
                  className="w-64 h-64"
                />
              )}
            </div>
            <p className="text-sm text-gray-600 text-center mb-4">
              Scan this QR code to visit this profile
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
