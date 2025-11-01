import Image from 'next/image';
import {getLocale, getTranslations} from 'next-intl/server';
import {asRoute} from '@/lib/typedRoutes';
import type { QuickGoal } from '@/lib/cms/types';

function pct(raised: number, goal: number){
  const p = Math.min(100, Math.max(0, Math.round((raised/goal)*100)));
  return isFinite(p) ? p : 0;
}

export default async function GoalCard({item}:{item: QuickGoal}){
  const locale = (await getLocale()) as 'uk'|'en';
  const tSections = await getTranslations({locale, namespace: 'sections'});
  const p = pct(item.raisedAmount, item.goalAmount);
  const nf = new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'uk-UA');
  const donateHref = asRoute(`/${locale}/donate`);

  return (
    <article className="bg-white rounded-2xl overflow-hidden border">
      <div className="aspect-video bg-slate-100" style={{ backgroundImage: `url('${item.cover || ''}')`, backgroundSize: "cover", backgroundPosition: "center" }}></div>
      <div className="p-5 space-y-3">
        <h3 className="font-semibold text-lg">{item.title}</h3>
        <div className="progress" role="progressbar" aria-valuenow={p} aria-valuemin={0} aria-valuemax={100}>
          <div className="progress__bar" style={{width: `${p}%`}}/>
        </div>
        <div className="text-sm text-slate-600 flex items-center justify-between">
          <span>{tSections('collected')}: {nf.format(item.raisedAmount)} ₴</span>
          <span>{tSections('goal')}: {nf.format(item.goalAmount)} ₴</span>
        </div>
        <a className="btn w-full justify-center" href={donateHref}>{tSections('support')}</a>
      </div>
    </article>
  );
}
