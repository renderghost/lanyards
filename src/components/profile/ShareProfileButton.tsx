'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Share2, Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ShareProfileButtonProps {
  url?: string;
  handle: string;
}

export default function ShareProfileButton({
  url,
  handle,
}: ShareProfileButtonProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [profileUrl, setProfileUrl] = useState('');

  useEffect(() => {
    setProfileUrl(url || `${window.location.origin}/${handle}`);
  }, [url, handle]);

  const handleOpenChange = async (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && !qrCodeDataUrl && profileUrl) {
      try {
        const dataUrl = await QRCode.toDataURL(profileUrl, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
        setQrCodeDataUrl(dataUrl);
      } catch (err) {
        console.error('Error generating QR code:', err);
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Profile</DialogTitle>
          <DialogDescription>
            Share this QR code or link at conferences and events
          </DialogDescription>
        </DialogHeader>

        {/* QR Code */}
        <div className="flex justify-center py-4">
          {qrCodeDataUrl && (
            <img
              src={qrCodeDataUrl}
              alt={`QR Code for ${handle}`}
              className="w-64 h-64 border rounded-lg"
            />
          )}
        </div>

        {/* URL Display */}
        <div className="space-y-2">
          <Label htmlFor="profile-url">Profile URL</Label>
          <div className="flex gap-2">
            <Input
              id="profile-url"
              value={profileUrl}
              readOnly
              className="flex-1"
            />
            <Button size="icon" onClick={handleCopyLink}>
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          {copied && (
            <p className="text-xs text-primary leading-tight">Copied to clipboard!</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
