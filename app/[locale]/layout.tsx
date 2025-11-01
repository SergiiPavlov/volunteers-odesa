import {ReactNode} from 'react';
import {NextIntlClientProvider} from 'next-intl';
import {unstable_setRequestLocale} from 'next-intl/server';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UARibbon from '@/components/UARibbon';

const dictionaries = {
  en: () => import('@/messages/en.json').then(m => m.default),
  uk: () => import('@/messages/uk.json').then(m => m.default)
} as const;

async function getMessages(locale: 'uk'|'en'){
  return await dictionaries[locale]();
}

export async function generateStaticParams(){
  return [{locale:'uk'},{locale:'en'}];
}

export default async function LocaleLayout({
  params,
  children
}: {
  params: { locale: 'uk'|'en' },
  children: ReactNode
}) {
  unstable_setRequestLocale(params.locale);

  const messages = await getMessages(params.locale);

  return (
    <html lang={params.locale}>
      <body className="ua-watermark-body">
        <NextIntlClientProvider messages={messages} locale={params.locale}>
          <Header locale={params.locale} />
          <UARibbon />
          <main>{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
