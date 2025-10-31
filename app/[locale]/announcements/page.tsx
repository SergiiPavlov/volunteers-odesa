
'use client';
import {useEffect, useState} from 'react';
import Container from '@/components/Container';

type Item = {
  id: string;
  title: string;
  body: string;
  contact: string;
  category: string;
  status: 'pending'|'approved'|'rejected';
  verified: boolean;
  createdAt: string;
};

export default function Page(){
  const [items, setItems] = useState<Item[]>([]);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({title:'', body:'', contact:'', category:''});
  const [error, setError] = useState<string|null>(null);

  async function load(){
    const r = await fetch('/api/announcements', {cache:'no-store'});
    const j = await r.json();
    setItems(j.items || []);
  }

  useEffect(()=>{ load(); },[]);

  async function onSubmit(e: React.FormEvent){
    e.preventDefault();
    setPending(true); setError(null);
    try{
      const r = await fetch('/api/announcements', {method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(form)});
      const j = await r.json();
      if(!r.ok) throw new Error(j?.error || 'Помилка');
      setForm({title:'', body:'', contact:'', category:''});
      await load();
    }catch(err:any){
      setError(err.message);
    }finally{
      setPending(false);
    }
  }

  return (
    <section className="section">
      <Container>
        <h1 className="h1">Оголошення</h1>

        <form onSubmit={onSubmit} className="bg-white rounded-2xl border p-5 mt-6 space-y-3">
          <div className="grid md:grid-cols-2 gap-4">
            <input className="border rounded-xl p-3" placeholder="Тема" required minLength={8} maxLength={140}
              value={form.title} onChange={e=>setForm({...form, title: e.target.value})} />
            <input className="border rounded-xl p-3" placeholder="Категорія" required
              value={form.category} onChange={e=>setForm({...form, category: e.target.value})} />
          </div>
          <textarea className="border rounded-xl p-3 w-full min-h-[120px]" placeholder="Текст" required minLength={20} maxLength={5000}
            value={form.body} onChange={e=>setForm({...form, body: e.target.value})} />
          <input className="border rounded-xl p-3 w-full" placeholder="Контакт (телеграм, email або телефон)" required
            value={form.contact} onChange={e=>setForm({...form, contact: e.target.value})} />
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button className="btn" disabled={pending}>{pending?'Надсилаємо…':'Опублікувати (модерація)'}</button>
          <p className="text-xs text-slate-500">Захист від спаму буде підключено пізніше (hCaptcha/Turnstile).</p>
        </form>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {items.map(i => (
            <article key={i.id} className="bg-white rounded-2xl border p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-lg">{i.title}</h3>
                <span className="badge">{i.status}</span>
              </div>
              <p className="text-slate-600 mt-2 whitespace-pre-line">{i.body}</p>
              <div className="text-sm text-slate-500 mt-3">Контакт: {i.contact}</div>
              <div className="text-xs text-slate-400 mt-1">{new Date(i.createdAt).toLocaleString('uk-UA')}</div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}