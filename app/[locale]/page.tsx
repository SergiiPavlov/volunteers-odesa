import Container from '@/components/Container';
import Link from 'next/link';
import {getTranslations} from 'next-intl/server';
import {getQuickGoals} from '@/lib/cms/fileProvider';
import GoalCard from '@/components/cards/GoalCard';
import type { Route } from 'next';

export async function generateStaticParams(){
  return [{locale:'uk'},{locale:'en'}];
}

export default async function Page({params}:{params:{locale:'uk'|'en'}){
  const t = await getTranslations({locale: params.locale, namespace:'hero'});
  const goals = await getQuickGoals(params.locale);

  return (
    <>
      {/* HERO */}
      <section className="section">
        <Container>
          <div className="grid md:grid-cols-2 gap-8 items-center py-10">
            <div className="space-y-6">
              <h1 className="h1">{t('title')}</h1>
              <p className="text-lg text-slate-700">{t('subtitle')}</p>
              <div className="flex gap-3">
                <Link href={`/${params.locale as Route}/donate`)} className="btn">Підтримати</Link>
                <Link href={`/${params.locale as Route}/about`)} className="btn btn-outline">Дізнатися більше</Link>
              </div>
            </div>
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden border bg-slate-100">
              <img
                src="https://picsum.photos/seed/hero-ukraine/1600/1200"
                alt="Volunteer activity"
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* QUICK GOALS */}
      <section className="section">
        <Container>
          <div className="flex items-center justify-between mb-6">
            <h2 className="h2">Швидкі цілі</h2>
            <Link href={`/${params.locale as Route}/donate`)} className="text-sm">Всі збори →</Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map(g => (<GoalCard key={g.id} item={g} />))}
          </div>
        </Container>
      </section>
    </>
  );
}