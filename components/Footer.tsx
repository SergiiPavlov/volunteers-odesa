import Link from 'next/link';
import {getLocale, getTranslations} from 'next-intl/server';

import Container from '@/components/Container';
import Icon from '@/components/Icon';
import footerEn from '@/content/footer.en.json';
import footerUk from '@/content/footer.uk.json';
import {asRoute} from '@/lib/typedRoutes';

type Locale = 'uk' | 'en';

const FOOTER_CONTENT = {
  uk: footerUk,
  en: footerEn,
} as const satisfies Record<Locale, typeof footerUk>;

const TECH_LINKS = [
  {href: '/manifest.webmanifest', label: 'PWA'},
  {href: '/robots.txt', label: 'robots.txt'},
  {href: '/sitemap.xml', label: 'sitemap.xml'},
];

function resolveRoute(template: string, locale: Locale) {
  return template.replace('{locale}', locale);
}

function formatPhoneNumber(phone: string) {
  return phone.replace(/\s+/g, '');
}

export default async function Footer() {
  const locale = (await getLocale()) as Locale;
  const [tFooter, tMenu, tReports] = await Promise.all([
    getTranslations({locale, namespace: 'footer'}),
    getTranslations({locale, namespace: 'menu'}),
    getTranslations({locale, namespace: 'home.reports'}),
  ]);

  const content = FOOTER_CONTENT[locale];
  const year = new Date().getFullYear();

  const quickLinks = content.quickLinks.map((link) => ({
    href: asRoute(resolveRoute(link.route, locale)),
    label: tMenu(link.labelKey.split('.').slice(1).join('.') as Parameters<typeof tMenu>[0]),
  }));

  const legalLinks = content.legalLinks.map((link) => ({
    href: asRoute(resolveRoute(link.route, locale)),
    label: tFooter(link.labelKey.split('.').slice(1).join('.') as Parameters<typeof tFooter>[0]),
  }));

  return (
    <footer role="contentinfo" className="mt-20 bg-slate-950 text-slate-100">
      <Container>
        <div className="grid gap-10 border-b border-white/10 py-12 md:grid-cols-3 lg:gap-16">
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-lg font-semibold text-white">{content.org.name}</p>
              <p className="mt-2 max-w-sm text-sm text-slate-300">{content.org.tagline}</p>
            </div>

            <Link
              href={asRoute(`/${locale}/reports`)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand transition hover:text-brand/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand/40"
            >
              {tReports('seeAll')} <span aria-hidden>→</span>
            </Link>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-300">{tFooter('follow')}</p>
              <ul className="mt-4 flex items-center gap-3">
                {content.socials.map((social) => (
                  <li key={social.id}>
                    <a
                      href={social.href}
                      aria-label={social.label}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white transition hover:border-brand hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand/40"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Icon name={social.id} className="h-4 w-4" />
                      <span className="sr-only">{social.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-300">{tFooter('quick')}</p>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-slate-300">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand/40"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-300">{tFooter('contacts')}</p>
              <address className="mt-4 not-italic text-sm text-slate-300">
                <p>{content.contacts.address}</p>
                <p className="mt-2">
                  <a
                    href={`mailto:${content.contacts.email}`}
                    className="transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand/40"
                  >
                    {content.contacts.email}
                  </a>
                </p>
                <ul className="mt-2 space-y-1">
                  {content.contacts.phones.map((phone) => (
                    <li key={phone}>
                      <a
                        href={`tel:${formatPhoneNumber(phone)}`}
                        className="transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand/40"
                      >
                        {phone}
                      </a>
                    </li>
                  ))}
                </ul>
              </address>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-300">{tFooter('legal')}</p>
              <ul className="mt-4 flex flex-col gap-3 text-sm text-slate-300">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand/40"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 py-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>
            {`${content.copyright} ${year}`}
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {TECH_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand/40"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
