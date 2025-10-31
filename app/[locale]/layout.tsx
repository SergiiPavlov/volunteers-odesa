import {ReactNode} from 'react';
import {NextIntlClientProvider} from 'next-intl';
import {unstable_setRequestLocale} from 'next-intl/server';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {appLocales, type AppLocale} from '@/i18n';

async function getMessages(locale: AppLocale){
  const messages = (await import(`@/public/locales/${locale}/common.json`)).default;
  return messages;
}

export async function generateStaticParams(){
  return appLocales.map(({code}) => ({locale: code}));
}

export default async function LocaleLayout({children, params}:{children:ReactNode, params:{locale:AppLocale}}){
  const messages = await getMessages(params.locale);
  unstable_setRequestLocale(params.locale);
  return (
    <html lang={params.locale}>
      <body>
        <NextIntlClientProvider messages={messages} locale={params.locale}>
          <Header locale={params.locale} />
          <main>{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
