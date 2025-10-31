'use client';

import {useEffect, useMemo, useState} from 'react';
import type {FormEvent} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import Container from '@/components/Container';
import type {AppLocale} from '@/i18n';

type Item = {
  id: string;
  title: string;
  body: string;
  contact: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  verified: boolean;
  createdAt: string;
};

type FormState = {
  title: string;
  body: string;
  contact: string;
  category: string;
};

const initialFormState: FormState = {
  title: '',
  body: '',
  contact: '',
  category: ''
};

export default function Page() {
  const locale = useLocale() as AppLocale;
  const t = useTranslations('pages.announcements');
  const [items, setItems] = useState<Item[]>([]);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState<FormState>(initialFormState);
  const [error, setError] = useState<string | null>(null);

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale === 'uk' ? 'uk-UA' : 'en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }),
    [locale]
  );

  async function load() {
    const response = await fetch('/api/announcements', {cache: 'no-store'});
    const data = await response.json();
    setItems(Array.isArray(data.items) ? data.items : []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify(form)
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || t('errors.generic'));
      }
      setForm(initialFormState);
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : t('errors.generic');
      setError(message);
    } finally {
      setPending(false);
    }
  }

  const submitLabel = pending ? t('form.submitting') : t('form.submit');

  return (
    <section className="section">
      <Container>
        <h1 className="h1">{t('title')}</h1>

        <form onSubmit={onSubmit} className="mt-6 space-y-3 rounded-2xl border bg-white p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <input
              className="rounded-xl border p-3"
              placeholder={t('form.titlePlaceholder')}
              required
              minLength={8}
              maxLength={140}
              value={form.title}
              onChange={(event) => setForm((prev) => ({...prev, title: event.target.value}))}
            />
            <input
              className="rounded-xl border p-3"
              placeholder={t('form.categoryPlaceholder')}
              required
              value={form.category}
              onChange={(event) => setForm((prev) => ({...prev, category: event.target.value}))}
            />
          </div>
          <textarea
            className="min-h-[120px] w-full rounded-xl border p-3"
            placeholder={t('form.textPlaceholder')}
            required
            minLength={20}
            maxLength={5000}
            value={form.body}
            onChange={(event) => setForm((prev) => ({...prev, body: event.target.value}))}
          />
          <input
            className="w-full rounded-xl border p-3"
            placeholder={t('form.contactPlaceholder')}
            required
            value={form.contact}
            onChange={(event) => setForm((prev) => ({...prev, contact: event.target.value}))}
          />
          {error ? <div className="text-sm text-red-600">{error}</div> : null}
          <button className="btn" disabled={pending}>
            {submitLabel}
          </button>
          <p className="text-xs text-slate-500">{t('form.help')}</p>
        </form>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article key={item.id} className="rounded-2xl border bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <span className="badge">{t(`statuses.${item.status}`)}</span>
              </div>
              <p className="mt-2 whitespace-pre-line text-slate-600">{item.body}</p>
              <div className="mt-3 text-sm text-slate-500">{t('list.contact', {contact: item.contact})}</div>
              <div className="mt-1 text-xs text-slate-400">{dateFormatter.format(new Date(item.createdAt))}</div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
