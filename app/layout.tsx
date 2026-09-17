import type { Metadata, Viewport } from 'next';
import './globals.css';
import { DEFAULT_MODE } from '@/lib/delphy/modes';

// Absolute URLs for social cards. Vercel injects VERCEL_URL per deployment, so
// a preview links to itself rather than to production.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000');

const DESCRIPTION =
  'A voice-native sparring partner that will not tell you what it thinks. Bring a position and defend it, in critical thinking mode or ragebait mode. Delphy only ever asks questions.';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  // Matches --background in the Delphy palette. It was near-black, which the
  // OS painted around a page that is deliberately paper white.
  themeColor: '#fdfcfa',
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Delphy',
  description: DESCRIPTION,
  applicationName: 'Delphy',
  // opengraph-image.tsx supplies the image for both cards automatically.
  openGraph: {
    title: 'Delphy',
    description: DESCRIPTION,
    siteName: 'Delphy',
    type: 'website',
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Delphy',
    description: DESCRIPTION,
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png' }],
    other: [
      {
        url: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    /* data-delphy-mode drives the accent palette in globals.css. Rendering the
       default here rather than setting it on mount avoids a first-paint flash
       of the wrong accent; LandingPage updates it when the mode changes. */
    <html lang="en" className="h-full" data-delphy-mode={DEFAULT_MODE}>
      <body className="h-full min-h-screen antialiased">{children}</body>
    </html>
  );
}
