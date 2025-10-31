import Image from 'next/image';
import Link from 'next/link';
import {getTranslations} from 'next-intl/server';
import Container from '@/components/Container';
import GoalCard from '@/components/cards/GoalCard';
import {getQuickGoals} from '@/lib/cms/fileProvider';
import {appLocales, type AppLocale} from '@/i18n';

export async function generateStaticParams() {
  return appLocales.map(({code}) => ({locale: code}));
}

export default async function Page({params}: {params: {locale: AppLocale}}) {
  const t = await getTranslations({locale: params.locale, namespace: 'pages.home'});
  const goals = await getQuickGoals(params.locale);

  return (
    <>
      <section className="section">
        <Container>
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <h1 className="h1">{t('hero.title')}</h1>
              <p className="text-lg text-slate-600">{t('hero.subtitle')}</p>
              <div className="flex flex-wrap gap-3">
                <Link href={`/${params.locale}/donate`} className="btn">
                  {t('hero.primaryCta')}
                </Link>
                <Link href={`/${params.locale}/about`} className="btn-outline">
                  {t('hero.secondaryCta')}
                </Link>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl shadow">
              <Image
                src="/images/placeholders/card.svg"
                alt={t('hero.imageAlt')}
                width={1600}
                height={900}
                priority
              />
            </div>
          </div>
        </Container>
      </section>

      <section className="section bg-slate-50">
        <Container>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="h2">{t('sections.quickGoals')}</h2>
            <Link href={`/${params.locale}/donate`} className="text-sm">
              {t('sections.allFundraisers')}
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal) => (
              <GoalCard key={goal.id} item={goal} locale={params.locale} />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
