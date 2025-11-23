import type { Metadata, Viewport } from 'next';
import { DM_Sans, DM_Serif_Text, DM_Mono } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const dmSerifText = DM_Serif_Text({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const dmMono = DM_Mono({
  weight: ['300', '400', '500'],
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Lanyards - Researcher Profiles on AT Protocol',
  description:
    'A dedicated profile for researchers, built on the AT Protocol. An alternative to ORCID.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${dmSerifText.variable} ${dmMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
