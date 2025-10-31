import {getRequestConfig} from 'next-intl/server';

export const appLocales = [
  {code: 'uk', label: 'UA'},
  {code: 'en', label: 'EN'}
] as const;

export type AppLocale = (typeof appLocales)[number]['code'];

export const defaultLocale: AppLocale = 'uk';

export default getRequestConfig(async ({locale}) => {
  const localeSafe = appLocales.some(({code}) => code === locale)
    ? (locale as AppLocale)
    : defaultLocale;

  return {
    messages: (await import(`./public/locales/${localeSafe}/common.json`)).default
  };
});
