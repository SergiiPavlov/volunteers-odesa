import Container from '@/components/Container';
import GalleryGrid from '@/components/sections/GalleryGrid';
import {getTranslations} from 'next-intl/server';

export default async function GalleryPage({params}: {params: {locale: 'uk' | 'en'}}) {
  const sections = await getTranslations({locale: params.locale, namespace: 'sections'});
  const gallery = await getTranslations({locale: params.locale, namespace: 'gallery'});

  return (
    <section className="section bg-white/40 backdrop-blur">
      <Container>
        <div className="max-w-2xl space-y-2">
          <h1 className="h1">{sections('gallery.title')}</h1>
          <p className="text-base text-slate-600">{gallery('teaser')}</p>
        </div>
        <div className="mt-8">
          <GalleryGrid />
        </div>
      </Container>
    </section>
  );
}
