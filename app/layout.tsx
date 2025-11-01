
import './globals.css';
import {ReactNode} from 'react';

export const metadata = {
  title: 'Волонтери',
  description: 'Разом для тих, хто захищає'
};

export default function RootLayout({children}:{children:ReactNode}){
  return (
    <html lang="uk">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body className="bg-gradient-to-b from-cyan-200 min-h-screen to-yellow-200 via-lime-200">{children}</body>
    </html>
  );
}