import { useTranslation } from 'react-i18next';

function About() {
  const { t } = useTranslation();
  return (
    <section className="container mx-auto py-16 px-4">
      <h2 className="text-3xl font-bold mb-6">{t('about.title')}</h2>
      <p className="leading-7 text-gray-700">{t('about.desc')}</p>
    </section>
  );
}

export default About; 