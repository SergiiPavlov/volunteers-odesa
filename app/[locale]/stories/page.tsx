import {getTranslations} from 'next-intl/server';
import Container from '@/components/Container';
import type {AppLocale} from '@/i18n';

type PageProps = {params: {locale: AppLocale}};

export default async function Page({params}: PageProps) {
  const t = await getTranslations({locale: params.locale, namespace: 'pages.stories'});
  const tCommon = await getTranslations({locale: params.locale, namespace: 'pages.common'});

  return (
    <section className="section">
      <Container>
        <h1 className="h1">{t('title')}</h1>
        <p className="mt-4 text-slate-600">{tCommon('underConstruction')}</p>
      </Container>
    </section>
  );
}