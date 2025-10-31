
'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {asRoute} from '@/lib/typedRoutes';

const locales = ['uk','en'] as const;

export default function LangSwitcher({current}:{current:'uk'|'en'}) {
  const pathname = usePathname();
  const stripped = pathname?.replace(/^\/(uk|en)/,'') || '';
  return (
    <div className="inline-flex gap-2 text-sm">
      {locales.map(l => (
        <Link
          key={l}
          href={asRoute(`/${l}${stripped || ''}`)}
          className={`px-2 py-1 rounded ${current===l ? 'bg-slate-200' : 'hover:bg-slate-100'}`}
          aria-current={current===l ? 'page' : undefined}
        >
          {l.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}