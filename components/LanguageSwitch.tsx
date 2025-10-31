'use client';

import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import type { Route } from 'next';

type Props = { locale: 'uk'|'en' };

export default function LanguageSwitch({ locale }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  function toPath(target: 'uk'|'en'): Route {
    const parts = (pathname ?? '/').split('/').filter(Boolean);
    if (parts.length === 0) {
      const q = search?.toString();
      return ('/' + target + (q ? '?' + q : '')) as Route;
    }
    if (parts[0] === 'uk' || parts[0] === 'en') parts[0] = target;
    else parts.unshift(target);
    const base = '/' + parts.join('/');
    const q = search?.toString();
    return (base + (q ? '?' + q : '')) as Route;
  }

  const other: 'uk'|'en' = locale === 'uk' ? 'en' : 'uk';
  const targetPath = toPath(other);

  return (
    <button
      type="button"
      onClick={() => router.push(targetPath)}
      className="px-3 py-2 rounded-xl border hover:bg-slate-50 text-sm"
      aria-label="Switch language"
    >
      {other.toUpperCase()}
    </button>
  );
}
