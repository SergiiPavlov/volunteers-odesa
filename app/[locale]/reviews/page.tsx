'use client';
import {useEffect, useState} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import Container from '@/components/Container';

type Item = {
  id: string;
  authorName: string;
  role: 'donor'|'recipient';
  text: string;
  status: 'pending'|'approved'|'rejected';
  createdAt: string;
};

export default function Page(){
  const [items, setItems] = useState<Item[]>([]);
  const [form, setForm] = useState<{authorName:string; role:'donor'|'recipient'; text:string}>({authorName:'', role:'donor', text:''});
  const [submitting, setSubmitting] = useState(false);

  const locale = (useLocale() as 'uk'|'en') ?? 'uk';
  const t = useTranslations('pages.reviews');
  const tForm = useTranslations('pages.reviews.form');

  useEffect(() => {
    let ignore=false;
    (async () => {
      try{
        const res = await fetch('/api/reviews', {cache:'no-store'});
        const data = await res.json();
        if(!ignore) setItems(Array.isArray(data?.items) ? data.items : []);
      }catch{ /* ignore */ }
    })();
    return () => { ignore=true; };
  }, []);

  async function onSubmit(e: React.FormEvent){
    e.preventDefault();
    setSubmitting(true);
    try{
      await fetch('/api/reviews', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(form)
      });
      setForm({authorName:'', role:'donor', text:''});
    }catch{/* ignore */}
    setSubmitting(false);
  }

  const nfLocale = locale === 'en' ? 'en-US' : 'uk-UA';

  return (
    <section className="section">
      <Container>
<h1 className="h1">{t("title")} <span className="px-3 text-slate-400">/</span> {t("getHelp")}</h1>

        <form onSubmit={onSubmit} className="bg-white rounded-2xl border p-5 mt-6 space-y-3">
          <div className="grid md:grid-cols-2 gap-4">
            <input className="border rounded-xl p-3" placeholder={tForm('name')} required minLength={2} maxLength={80}
              value={form.authorName} onChange={e=>setForm({...form, authorName: e.target.value})} />
            <select className="border rounded-xl p-3" value={form.role} onChange={e=>setForm({...form, role: e.target.value as any})}>
              <option value="donor">{tForm('donor')}</option>
              <option value="recipient">{tForm('recipient')}</option>
            </select>
          </div>
          <textarea className="border rounded-xl p-3 w-full min-h-32" placeholder={tForm('text')} required minLength={10} maxLength={1000}
            value={form.text} onChange={e=>setForm({...form, text: e.target.value})} />
          <button className="btn" type="submit" disabled={submitting}>{tForm('submit')}</button>
        </form>

        <div className="grid md:grid-cols-2 gap-6 mt-10">
          {items.map(i => (
            <article key={i.id} className="bg-white rounded-2xl border p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold">{i.authorName}</h3>
                <span className="badge">{i.role}</span>
              </div>
              <p className="text-slate-600 mt-2 whitespace-pre-line">{i.text}</p>
              <div className="text-xs text-slate-400 mt-1">{new Date(i.createdAt).toLocaleString(nfLocale)}</div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
