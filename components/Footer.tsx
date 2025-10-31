import {getTranslations} from 'next-intl/server';

export default async function Footer() {
  const t = await getTranslations({namespace: 'components.footer'});

  return (
    <footer className="mt-20 border-t">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-10 text-sm text-slate-600 md:flex-row">
        <div>{t('copyright')}</div>
        <div className="flex items-center gap-4">
          <a href="/manifest.webmanifest">{t('links.pwa')}</a>
          <a href="/robots.txt">{t('links.robots')}</a>
          <a href="/sitemap.xml">{t('links.sitemap')}</a>
        </div>
      </div>
    </footer>
  );
}