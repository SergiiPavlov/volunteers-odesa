
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
      <body>{children}</body>
    </html>
  );
}