import Image from 'next/image';
import Container from '@/components/Container';
import Link from 'next/link';
import {getTranslations} from 'next-intl/server';
import {getQuickGoals} from '@/lib/cms/fileProvider';
import GoalCard from '@/components/cards/GoalCard';
import {asRoute} from '@/lib/typedRoutes';
import ImpactCounters from '@/components/sections/ImpactCounters';
import HowToHelp from '@/components/sections/HowToHelp';
import ReviewsCarousel from '@/components/sections/ReviewsCarousel';

export async function generateStaticParams(){
  return [{locale:'uk'},{locale:'en'}];
}

export default async function Page({params}:{params:{locale:'uk'|'en'}}){
  const t = await getTranslations({locale: params.locale, namespace:'hero'});
  const tSections = await getTranslations({locale: params.locale, namespace:'sections'});
  const goals = await getQuickGoals(params.locale);

  return (
    <>
      {/* HERO */}
      <section className="section">
        <Container>
          <div className="grid md:grid-cols-2 gap-8 items-center py-10">
            <div className="space-y-6 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-6">
  {/* Amondrex logo without extra tile */}
  <div className="relative h-24 w-24 md:h-36 md:w-36">
    <Image src="/images/logos/amondrex_white.png" alt="Amondrex Charity Fund" fill className="object-contain object-center" priority />
  </div>
  {/* Trident logo, same size */}
  <div className="relative h-24 w-24 md:h-36 md:w-36">
    <Image src="/images/logos/ua-trident.png" alt="Ukraine coat of arms" fill className="object-contain object-center" />
  </div>
</div>
<h1 className="h1">{t('title')}</h1>
              <p className="text-lg text-slate-700">{t('subtitle')}</p>
              <div className="flex gap-3 justify-center md:justify-start">
                <Link href={asRoute(`/${params.locale}/donate`)} className="btn">{t("ctaDonate")}</Link>
                <Link href={asRoute(`/${params.locale}/about`)} className="btn btn-outline">{t("ctaLearnMore")}</Link>
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

      <ImpactCounters />
      <HowToHelp />
      <ReviewsCarousel />

      {/* QUICK GOALS */}
      <section className="section">
        <Container>
          <div className="flex items-center justify-between mb-6">
            <h2 className="h2">{tSections("quickGoals")}</h2>
            <Link href={asRoute(`/${params.locale}/donate`)} className="text-sm">{tSections("allFundraisers")} →</Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map(g => (<GoalCard key={g.id} item={g} />))}
          </div>
        </Container>
      </section>
    </>
  );
}