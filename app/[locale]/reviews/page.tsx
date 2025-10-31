
'use client';
import {useEffect, useState} from 'react';
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
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({authorName:'', role:'donor', text:''});
  const [error, setError] = useState<string|null>(null);

  async function load(){
    const r = await fetch('/api/reviews', {cache:'no-store'});
    const j = await r.json();
    setItems(j.items || []);
  }

  useEffect(()=>{ load(); },[]);

  async function onSubmit(e: React.FormEvent){
    e.preventDefault();
    setPending(true); setError(null);
    try{
      const r = await fetch('/api/reviews', {method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(form)});
      const j = await r.json();
      if(!r.ok) throw new Error(j?.error || 'Помилка');
      setForm({authorName:'', role:'donor', text:''});
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
        <h1 className="h1">Відгуки</h1>

        <form onSubmit={onSubmit} className="bg-white rounded-2xl border p-5 mt-6 space-y-3">
          <div className="grid md:grid-cols-2 gap-4">
            <input className="border rounded-xl p-3" placeholder="Імʼя" required minLength={2} maxLength={80}
              value={form.authorName} onChange={e=>setForm({...form, authorName: e.target.value})} />
            <select className="border rounded-xl p-3" value={form.role} onChange={e=>setForm({...form, role: e.target.value as any})}>
              <option value="donor">Донор</option>
              <option value="recipient">Отримувач</option>
            </select>
          </div>
          <textarea className="border rounded-xl p-3 w-full min-h-[120px]" placeholder="Ваш відгук" required minLength={10} maxLength={2000}
            value={form.text} onChange={e=>setForm({...form, text: e.target.value})} />
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button className="btn" disabled={pending}>{pending?'Надсилаємо…':'Опублікувати (модерація)'}</button>
          <p className="text-xs text-slate-500">Показ буде після модерації. Антиспам додамо на наступному етапі.</p>
        </form>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {items.map(i => (
            <article key={i.id} className="bg-white rounded-2xl border p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold">{i.authorName}</h3>
                <span className="badge">{i.role}</span>
              </div>
              <p className="text-slate-600 mt-2 whitespace-pre-line">{i.text}</p>
              <div className="text-xs text-slate-400 mt-1">{new Date(i.createdAt).toLocaleString('uk-UA')}</div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}