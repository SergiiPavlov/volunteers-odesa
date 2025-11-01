import Container from '@/components/Container';
import {getTranslations} from 'next-intl/server';

export default async function Page({params}:{params:{locale:'uk'|'en'}}){
  const t = await getTranslations({locale: params.locale, namespace:'pages'});
  return (
    <section className="section">
      <Container>
        <h1 className="h1">{t('news.title')}</h1>
        <p className="mt-4 text-slate-600">{t('common.underConstruction')}</p>
      </Container>
    </section>
  );
}
