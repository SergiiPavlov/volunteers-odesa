import Image from 'next/image';
import Link from 'next/link';
import {getTranslations} from 'next-intl/server';
import type {QuickGoal} from '@/lib/cms/types';
import type {AppLocale} from '@/i18n';

type Props = {
  item: QuickGoal;
  locale: AppLocale;
};

function pct(raised: number, goal: number) {
  const p = Math.min(100, Math.max(0, Math.round((raised / goal) * 100)));
  return Number.isFinite(p) ? p : 0;
}

function formatAmount(locale: AppLocale, value: number) {
  const formatter = new Intl.NumberFormat(locale === 'uk' ? 'uk-UA' : 'en-US', {
    maximumFractionDigits: 0
  });
  return formatter.format(value);
}

export default async function GoalCard({item, locale}: Props) {
  const t = await getTranslations({locale, namespace: 'components.goalCard'});
  const p = pct(item.raisedAmount, item.goalAmount);
  const raisedFormatted = formatAmount(locale, item.raisedAmount);
  const goalFormatted = formatAmount(locale, item.goalAmount);
  const currencySymbol = '₴';

  return (
    <article className="overflow-hidden rounded-2xl border bg-white">
      <div className="aspect-video bg-slate-100">
        <Image
          src={item.cover || '/images/placeholders/card.svg'}
          alt={t('imageAlt', {title: item.title})}
          width={1600}
          height={900}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="space-y-3 p-5">
        <h3 className="text-lg font-semibold">{item.title}</h3>
        <div
          className="progress"
          role="progressbar"
          aria-valuenow={p}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t('progressLabel', {percentage: p})}
        >
          <div className="progress__bar" style={{width: `${p}%`}} />
        </div>
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>{t('raised', {amount: raisedFormatted, currency: currencySymbol})}</span>
          <span>{t('goal', {amount: goalFormatted, currency: currencySymbol})}</span>
        </div>
        <Link className="btn flex w-full justify-center" href={`/${locale}/donate`} prefetch>
          {t('supportCta')}
        </Link>
      </div>
    </article>
  );
}