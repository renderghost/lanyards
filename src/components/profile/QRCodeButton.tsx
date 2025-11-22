'use client';

import { useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QRCodeButtonProps {
  url?: string; // Optional: if not provided, will use current origin + handle
  handle: string;
  className?: string;
}

export default function QRCodeButton({ url, handle, className }: QRCodeButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [copied, setCopied] = useState(false);

  // Construct the profile URL - lazy evaluation to avoid SSR issues
  const getProfileUrl = () => url || `${window.location.origin}/${handle}`;

  const generateQRCode = async () => {
    try {
      const profileUrl = getProfileUrl();
      const dataUrl = await QRCode.toDataURL(profileUrl, {
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

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getProfileUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={generateQRCode}
        className={cn('w-full', className)}
      >
        View as QR Code
      </Button>

      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4 text-center">
              Share Profile
            </h3>

            {/* QR Code */}
            <div className="flex justify-center mb-4">
              {qrCodeDataUrl && (
                <img
                  src={qrCodeDataUrl}
                  alt={`QR Code for ${handle}`}
                  className="w-64 h-64 border border-gray-200 rounded-lg"
                />
              )}
            </div>

            {/* URL Display */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={getProfileUrl()}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {copied ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {copied && (
                <p className="text-xs text-green-600 mt-1">
                  Copied to clipboard!
                </p>
              )}
            </div>

            <p className="text-xs text-gray-600 text-center mb-4">
              Scan or share this QR code
            </p>

            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-gray-100 text-gray-900 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
