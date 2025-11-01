import {getRequestConfig} from 'next-intl/server';

const dictionaries = {
  en: () => import('./messages/en.json').then(m => m.default),
  uk: () => import('./messages/uk.json').then(m => m.default)
} as const;

export default getRequestConfig(async ({locale}) => ({
  messages: await dictionaries[(locale as 'uk'|'en') ?? 'uk']()
}));
