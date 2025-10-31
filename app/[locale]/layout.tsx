import {ReactNode} from 'react';
import {NextIntlClientProvider} from 'next-intl';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UARibbon from '@/components/UARibbon';

async function getMessages(locale: 'uk'|'en'){
  const messages = (await import(`@/public/locales/${locale}/common.json`)).default;
  return messages;
}

export async function generateStaticParams(){
  return [{locale:'uk'},{locale:'en'}];
}

export default async function LocaleLayout({children, params}:{children:ReactNode, params:{locale:'uk'|'en'}}){
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
