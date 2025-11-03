'use client';

import dynamic from 'next/dynamic';

const AidMapClient = dynamic(() => import('./AidMap.client'), {
  ssr: false,
  loading: () => (
    <section className="section">
      <div className="h-[420px] md:h-[520px] rounded-3xl bg-slate-100 animate-pulse" />
    </section>
  ),
});

export default AidMapClient;
