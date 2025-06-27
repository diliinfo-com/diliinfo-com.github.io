import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function SecondCTA() {
  const { t } = useTranslation();
  return (
    <section className="relative overflow-hidden py-24 bg-gradient-to-r from-primary-600 via-primary-500 to-primary-700 text-white text-center">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4)_0%,transparent_40%)]" />
      <div className="container relative z-10">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-6 animate-fade-in-up">
          {t('home.cta2.title')}
        </h2>
        <p className="mb-10 opacity-90 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          {t('home.cta2.subtitle')}
        </p>
        <Link
          to="/loan?promo=freeInterest"
          className="btn-primary bg-white text-primary-600 hover:bg-gray-100 text-lg md:text-xl px-10 py-4 rounded-full shadow-xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}
        >
          {t('home.heroCTA')}
        </Link>
      </div>
    </section>
  );
} 