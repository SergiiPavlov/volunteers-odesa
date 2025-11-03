import type {MetadataRoute} from 'next';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://volunteers-odesa.vercel.app').replace(/\/$/, '');
const locales = ['uk', 'en'] as const;
const routes = [
  '',
  '/about',
  '/donate',
  '/donate/thank-you',
  '/news',
  '/partners',
  '/reviews',
  '/stories',
  '/contacts',
  '/announcements',
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return locales.flatMap(locale => {
    return routes.map(route => {
      const suffix = route === '' ? '' : route;
      const path = `/${locale}${suffix}`;
      const alternatePath = (targetLocale: (typeof locales)[number]) =>
        `${siteUrl}/${targetLocale}${suffix}`;

      const priority = route === '' ? 0.8 : ['/donate', '/reviews', '/news'].includes(route) ? 0.7 : 0.6;

      return {
        url: `${siteUrl}${path}`,
        lastModified,
        priority,
        alternates: {
          languages: {
            uk: alternatePath('uk'),
            en: alternatePath('en'),
          },
        },
      } satisfies MetadataRoute.Sitemap[number];
    });
  });
}
