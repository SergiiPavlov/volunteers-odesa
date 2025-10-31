
import Image from 'next/image';
import type { QuickGoal } from '@/lib/cms/types';

function pct(raised: number, goal: number){
  const p = Math.min(100, Math.max(0, Math.round((raised/goal)*100)));
  return isFinite(p) ? p : 0;
}

export default function GoalCard({item}:{item: QuickGoal}){
  const p = pct(item.raisedAmount, item.goalAmount);
  return (
    <article className="bg-white rounded-2xl overflow-hidden border">
      <div className="aspect-video bg-slate-100">
        <Image src={item.cover || '/images/placeholders/card.svg'} alt="" width={1600} height={900} className="w-full h-full object-cover"/>
      </div>
      <div className="p-5 space-y-3">
        <h3 className="font-semibold text-lg">{item.title}</h3>
        <div className="progress" role="progressbar" aria-valuenow={p} aria-valuemin={0} aria-valuemax={100}>
          <div className="progress__bar" style={{width: `${p}%`}}/>
        </div>
        <div className="text-sm text-slate-600 flex items-center justify-between">
          <span>Зібрано: {item.raisedAmount.toLocaleString('uk-UA')} ₴</span>
          <span>Ціль: {item.goalAmount.toLocaleString('uk-UA')} ₴</span>
        </div>
        <a className="btn w-full justify-center" href="/uk/donate">Підтримати</a>
      </div>
    </article>
  );
}