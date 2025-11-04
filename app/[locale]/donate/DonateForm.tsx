'use client';

import {useMemo, useState} from 'react';
import clsx from 'clsx';
import {useLocale, useTranslations} from 'next-intl';

const PRESETS = [200, 500, 1000, 2500];

const MIN_AMOUNT = 10;
const MAX_NAME_LENGTH = 60;

export type DonateFormProps = {
  locale: 'uk'|'en';
};

type FormState = {
  amount: number | null;
  customAmount: string;
  isPublic: boolean;
  name: string;
};

type FieldErrors = {
  amount?: string;
  name?: string;
};

export default function DonateForm({locale}: DonateFormProps) {
  const t = useTranslations('donate');
  const tErrors = useTranslations('donate.errors');
  const currentLocale = (useLocale() as 'uk'|'en') ?? locale;

  const [form, setForm] = useState<FormState>({
    amount: null,
    customAmount: '',
    isPublic: false,
    name: '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle'|'success'|'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [payloadPreview, setPayloadPreview] = useState<Record<string, unknown> | null>(null);

  const amountValue = useMemo(() => {
    if (form.customAmount) {
      const value = Number(form.customAmount);
      return Number.isFinite(value) ? value : null;
    }
    return form.amount;
  }, [form.amount, form.customAmount]);

  const isNameVisible = form.isPublic;

  const isFormValid = useMemo(() => {
    if (!amountValue || amountValue < MIN_AMOUNT) return false;
    if (isNameVisible) {
      const trimmed = form.name.trim();
      if (!trimmed) return false;
      if (trimmed.length > MAX_NAME_LENGTH) return false;
    }
    return true;
  }, [amountValue, form.name, isNameVisible]);

  function handlePresetClick(value: number) {
    setForm((prev) => ({...prev, amount: value, customAmount: ''}));
    setErrors((prev) => ({...prev, amount: undefined}));
  }

  function handleCustomAmount(value: string) {
    const sanitized = value.replace(/[^0-9.,]/g, '').replace(',', '.');
    setForm((prev) => ({...prev, customAmount: sanitized, amount: null}));
    setErrors((prev) => ({...prev, amount: undefined}));
  }

  function toggleVisibility(next: boolean) {
    setForm((prev) => ({...prev, isPublic: next, name: next ? prev.name : '',}));
    setErrors((prev) => ({...prev, name: undefined}));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: FieldErrors = {};
    const numericAmount = amountValue ?? null;

    if (!numericAmount) {
      nextErrors.amount = tErrors('amountRequired');
    } else if (numericAmount < MIN_AMOUNT) {
      nextErrors.amount = tErrors('amountMin', {value: MIN_AMOUNT});
    }

    let nameToSend: string | undefined;
    if (isNameVisible) {
      const trimmed = form.name.trim();
      if (!trimmed) {
        nextErrors.name = tErrors('nameRequired');
      } else if (trimmed.length > MAX_NAME_LENGTH) {
        nextErrors.name = tErrors('nameMax', {max: MAX_NAME_LENGTH});
      } else {
        nameToSend = trimmed;
      }
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !numericAmount) {
      setStatus('error');
      setStatusMessage(t('validationError'));
      setPayloadPreview(null);
      return;
    }

    setSubmitting(true);
    setStatus('idle');
    setStatusMessage('');

    try {
      const response = await fetch('/api/payments/liqpay', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          amount: numericAmount,
          isPublic: form.isPublic,
          name: nameToSend,
          locale: currentLocale,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        const message = typeof payload?.error === 'string' ? payload.error : t('unknownError');
        setStatus('error');
        setStatusMessage(message);
        setPayloadPreview(null);
      } else {
        setStatus('success');
        setStatusMessage(t('successNotice'));
        setErrors({});
        if (process.env.NODE_ENV === 'development') {
          setPayloadPreview(payload?.payloadPreview ?? null);
        } else {
          setPayloadPreview(null);
        }
      }
    } catch (error) {
      setStatus('error');
      setStatusMessage(t('networkError'));
      setPayloadPreview(null);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10 max-w-2xl space-y-8" noValidate>
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">{t('amount.label')}</p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PRESETS.map((value) => {
            const isActive = form.amount === value && !form.customAmount;
            return (
              <button
                key={value}
                type="button"
                onClick={() => handlePresetClick(value)}
                className={clsx(
                  'rounded-xl border px-4 py-3 text-center text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand/40',
                  isActive ? 'border-brand bg-brand text-white shadow-lg shadow-brand/30' : 'border-slate-200 bg-white text-slate-700 hover:border-brand/60 hover:text-brand'
                )}
              >
                {t('amount.preset', {value})}
              </button>
            );
          })}
        </div>
        <label className="mt-4 block text-sm text-slate-600" htmlFor="custom-amount">
          {t('amount.customLabel')}
        </label>
        <div className="mt-2">
          <input
            id="custom-amount"
            inputMode="numeric"
            pattern="[0-9.,]*"
            className={clsx(
              'w-full rounded-xl border bg-white px-4 py-3 text-base shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand/40 sm:max-w-xs',
              errors.amount ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200 hover:border-slate-300'
            )}
            placeholder={t('amount.customPlaceholder')}
            min={MIN_AMOUNT}
            value={form.customAmount}
            onChange={(event) => handleCustomAmount(event.target.value)}
            aria-invalid={errors.amount ? 'true' : 'false'}
            aria-describedby={errors.amount ? 'amount-error' : undefined}
          />
        </div>
        {errors.amount ? (
          <p id="amount-error" className="mt-2 text-sm text-red-600">
            {errors.amount}
          </p>
        ) : (
          <p className="mt-2 text-sm text-slate-500">{t('amount.hint', {value: MIN_AMOUNT})}</p>
        )}
      </div>

      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">{t('visibility.label')}</p>
        <div className="mt-3 inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm" role="group" aria-label={t('visibility.groupLabel')}>
          <button
            type="button"
            onClick={() => toggleVisibility(false)}
            className={clsx(
              'rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand/40',
              !form.isPublic ? 'bg-brand text-white shadow' : 'text-slate-600 hover:text-brand'
            )}
            aria-pressed={!form.isPublic}
          >
            {t('visibility.anonymous')}
          </button>
          <button
            type="button"
            onClick={() => toggleVisibility(true)}
            className={clsx(
              'rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand/40',
              form.isPublic ? 'bg-brand text-white shadow' : 'text-slate-600 hover:text-brand'
            )}
            aria-pressed={form.isPublic}
          >
            {t('visibility.public')}
          </button>
        </div>
        <div className="mt-4 flex items-start gap-3">
          <input
            id="consent"
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
            checked={form.isPublic}
            onChange={(event) => toggleVisibility(event.target.checked)}
          />
          <label htmlFor="consent" className="text-sm text-slate-600">
            {t('consent.label')}
          </label>
        </div>
      </div>

      {isNameVisible && (
        <div>
          <label htmlFor="donor-name" className="block text-sm font-medium text-slate-700">
            {t('name.label')}
          </label>
          <input
            id="donor-name"
            type="text"
            autoComplete="name"
            maxLength={MAX_NAME_LENGTH}
            className={clsx(
              'mt-2 w-full rounded-xl border bg-white px-4 py-3 text-base shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand/40 sm:max-w-md',
              errors.name ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200 hover:border-slate-300'
            )}
            placeholder={t('name.placeholder')}
            value={form.name}
            onChange={(event) => {
              const value = event.target.value;
              setForm((prev) => ({...prev, name: value}));
              setErrors((prev) => ({...prev, name: undefined}));
            }}
            aria-invalid={errors.name ? 'true' : 'false'}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name ? (
            <p id="name-error" className="mt-2 text-sm text-red-600">
              {errors.name}
            </p>
          ) : (
            <p className="mt-2 text-sm text-slate-500">{t('name.hint')}</p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          className="btn"
          disabled={!isFormValid || submitting}
        >
          {submitting ? t('submit.loading') : t('submit.label')}
        </button>
        <p className="text-sm text-slate-500">{t('secureNote')}</p>
      </div>

      <div className="text-sm" aria-live="polite" role="status">
        {statusMessage && (
          <div
            className={clsx(
              'rounded-xl border px-4 py-3 shadow-sm',
              status === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : status === 'error'
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : 'border-slate-200 bg-white text-slate-600'
            )}
          >
            {statusMessage}
          </div>
        )}
      </div>

      {process.env.NODE_ENV === 'development' && payloadPreview ? (
        <div className="space-y-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-700">{t('preview.title')}</p>
          <pre className="max-h-80 overflow-auto rounded-xl bg-slate-900 p-4 text-xs text-slate-100">
            {JSON.stringify(payloadPreview, null, 2)}
          </pre>
        </div>
      ) : null}
    </form>
  );
}
