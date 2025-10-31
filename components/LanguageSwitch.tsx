'use client';
import {usePathname, useRouter} from 'next/navigation';
import {useMemo} from 'react';

type Props = { locale: 'uk'|'en' };

export default function LanguageSwitch({locale}: Props){
  const pathname = usePathname() || '/';
  const router = useRouter();

  const other = locale === 'uk' ? 'en' : 'uk';

  const targetPath = useMemo(() => {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length === 0) return `/${other}`;
    if (parts[0] === 'uk' || parts[0] === 'en') {
      parts[0] = other;
    } else {
      parts.unshift(other);
    }
    return '/' + parts.join('/');
  }, [pathname, other]);

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
