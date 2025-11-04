import type {Metadata} from 'next';
import './globals.css';
import {ReactNode} from 'react';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://volunteers-odesa.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Волонтери',
    template: '%s | Волонтери',
  },
  description: 'Разом для тих, хто захищає',
  alternates: {
    canonical: '/',
    languages: {
      uk: '/uk',
      en: '/en',
    },
  },
  openGraph: {
    type: 'website',
    siteName: 'Volunteer Foundation Odesa',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/opengraph-image'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-32x32.png',
    apple: '/icon-512.png',
  },
  manifest: '/manifest.webmanifest',
  themeColor: '#0057B8',
};

export default function RootLayout({children}:{children:ReactNode}){
  return (
    <html lang="uk">
      <body className="bg-gradient-to-b from-cyan-200 min-h-screen to-yellow-200 via-lime-200">{children}</body>
    </html>
  );
}
