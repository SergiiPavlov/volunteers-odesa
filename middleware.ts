
import createMiddleware from 'next-intl/middleware';
import {appLocales, defaultLocale} from './i18n';

const localeCodes = appLocales.map(({code}) => code);

export default createMiddleware({
  locales: localeCodes,
  defaultLocale
});

export const config = {
  matcher: ['/', '/(uk|en)/:path*']
};