'use client';

import {useEffect, useMemo, useState} from 'react';
import type {FormEvent} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import Container from '@/components/Container';
import type {AppLocale} from '@/i18n';

type Item = {
  id: string;
  authorName: string;
  role: 'donor' | 'recipient';
  text: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
};

type FormState = {
  authorName: string;
  role: 'donor' | 'recipient';
  text: string;
};

const initialFormState: FormState = {
  authorName: '',
  role: 'donor',
  text: ''
};

export default function Page() {
  const locale = useLocale() as AppLocale;
  const t = useTranslations('pages.reviews');
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
    const response = await fetch('/api/reviews', {cache: 'no-store'});
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
      const response = await fetch('/api/reviews', {
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
              placeholder={t('form.namePlaceholder')}
              required
              minLength={2}
              maxLength={80}
              value={form.authorName}
              onChange={(event) => setForm((prev) => ({...prev, authorName: event.target.value}))}
            />
            <select
              className="rounded-xl border p-3"
              value={form.role}
              onChange={(event) => setForm((prev) => ({...prev, role: event.target.value as FormState['role']}))}
            >
              <option value="donor">{t('form.roles.donor')}</option>
              <option value="recipient">{t('form.roles.recipient')}</option>
            </select>
          </div>
          <textarea
            className="min-h-[120px] w-full rounded-xl border p-3"
            placeholder={t('form.reviewPlaceholder')}
            required
            minLength={10}
            maxLength={2000}
            value={form.text}
            onChange={(event) => setForm((prev) => ({...prev, text: event.target.value}))}
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
                <h3 className="font-semibold">{item.authorName}</h3>
                <span className="badge">{t(`roles.${item.role}`)}</span>
              </div>
              <p className="mt-2 whitespace-pre-line text-slate-600">{item.text}</p>
              <div className="mt-1 text-xs text-slate-400">{dateFormatter.format(new Date(item.createdAt))}</div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
