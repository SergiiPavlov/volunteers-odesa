import type {Metadata} from 'next';
import Container from '@/components/Container';
import {getTranslations} from 'next-intl/server';

import DonateForm from './DonateForm';

type PageProps = {params: {locale: 'uk'|'en'}};

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
  const t = await getTranslations({locale: params.locale, namespace: 'seo.donate'});

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `/${params.locale}/donate`,
      languages: {
        uk: '/uk/donate',
        en: '/en/donate',
      },
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      images: ['/opengraph-image'],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: ['/opengraph-image'],
    },
  };
}

export default async function Page({params}: PageProps) {
  const [tPage, tDonate] = await Promise.all([
    getTranslations({locale: params.locale, namespace: 'pages.donate'}),
    getTranslations({locale: params.locale, namespace: 'donate'}),
  ]);

  return (
    <section className="section">
      <Container>
        <div className="mx-auto max-w-2xl">
          <h1 className="h1">{tPage('title')}</h1>
          <p className="mt-4 text-lg text-slate-600">{tDonate('intro')}</p>
        </div>
        <DonateForm locale={params.locale} />
      </Container>
    </section>
  );
}
