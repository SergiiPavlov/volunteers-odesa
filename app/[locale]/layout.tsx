import {ReactNode} from 'react';
import {NextIntlClientProvider} from 'next-intl';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
      <body>
        <NextIntlClientProvider messages={messages} locale={params.locale}>
          {/* @ts-expect-error Server Component */}
          <Header locale={params.locale} />
          <main>{children}</main>
          {/* @ts-expect-error Server Component */}
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
