import type { Metadata, Viewport } from 'next';
import { Inter, Instrument_Serif } from 'next/font/google';
import './globals.css';

// Body text. Variable weight, so every UI weight comes from one file.
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

// Display face — used only for the Delphy wordmark. Instrument Serif has the
// high-contrast, slightly literary feel the devil's-advocate framing wants.
const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-serif',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0e0e11',
};

export const metadata: Metadata = {
  title: 'Delphy',
  description:
    "A voice-native devil's advocate that will not tell you what it thinks. Bring a position and defend it — Delphy only ever asks questions.",
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
    <html
      lang="en"
      className={`h-full ${inter.variable} ${instrumentSerif.variable}`}
    >
      <body className="h-full min-h-screen antialiased">{children}</body>
    </html>
  );
}
