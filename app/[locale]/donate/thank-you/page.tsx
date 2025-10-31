import Link from 'next/link';
import {getTranslations} from 'next-intl/server';
import Container from '@/components/Container';
import type {AppLocale} from '@/i18n';

type PageProps = {params: {locale: AppLocale}};

export default async function Page({params}: PageProps) {
  const t = await getTranslations({locale: params.locale, namespace: 'pages.donate.thankYou'});

  return (
    <section className="section">
      <Container>
        <h1 className="h1">{t('title')}</h1>
        <p className="mt-4 text-slate-600">{t('description')}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/${params.locale}`} className="btn">
            {t('toHome')}
          </Link>
          <Link href={`/${params.locale}/stories`} className="btn-outline">
            {t('seeStories')}
          </Link>
        </div>
      </Container>
    </section>
  );
}
