import Container from '@/components/Container';
import Image from 'next/image';
import Link from 'next/link';
import {getTranslations} from 'next-intl/server';
import {getQuickGoals} from '@/lib/cms/fileProvider';
import GoalCard from '@/components/cards/GoalCard';

export async function generateStaticParams(){
  return [{locale:'uk'},{locale:'en'}];
}

export default async function Page({params}:{params:{locale:'uk'|'en'}}){
  const t = await getTranslations({locale: params.locale, namespace:'hero'});
  const goals = await getQuickGoals(params.locale);
  return (
    <>
      <section className="section">
        <Container>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="h1">{t('title')}</h1>
              <p className="text-lg text-slate-600">{t('subtitle')}</p>
              <div className="flex gap-3">
                <Link href={`/${params.locale}/donate`} className="btn">Підтримати зараз</Link>
                <Link href={`/${params.locale}/about`} className="btn-outline">Дізнатися більше</Link>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow">
              <Image src="/images/placeholders/card.svg" alt="" width={1600} height={900} priority />
            </div>
          </div>
        </Container>
      </section>

      <section className="section bg-slate-50">
        <Container>
          <div className="flex items-center justify-between mb-6">
            <h2 className="h2">Швидкі цілі</h2>
            <Link href={`/${params.locale}/donate`} className="text-sm">Всі збори →</Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map(g => (<GoalCard key={g.id} item={g} />))}
          </div>
        </Container>
      </section>
    </>
  );
}
