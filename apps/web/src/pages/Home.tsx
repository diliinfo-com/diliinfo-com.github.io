import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import StatsSection from '../components/Stats';
import StepsSection from '../components/Steps';
import SecondCTA from '../components/CTA2';

function Home() {
  const { t } = useTranslation();
  return (
    <div>
      {/* Hero */}
      <section className="pt-24 pb-32 bg-gradient-to-b from-primary-500 to-primary-700 text-white text-center relative overflow-hidden">
        {/* Subtle gradient grid pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-5 bg-[url('data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M40 39H0v1h40v-1ZM0 0v1h40V0H0Z\' fill=\'%23fff\' fill-rule=\'evenodd\'/%3E%3C/svg%3E')]" />
        {/* Blurred animated blobs */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-primary-400 opacity-30 rounded-full filter blur-3xl animate-blob" />
        <div className="absolute -bottom-24 -right-16 w-80 h-80 bg-blue-300 opacity-20 rounded-full filter blur-3xl animate-blob animation-delay-2000" />

        <div className="container relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight animate-fade-in-up">
            {t('home.heroTitle')}
          </h1>
          <p className="mb-12 text-lg md:text-2xl opacity-90 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {t('home.heroSubtitle')}
          </p>
          <Link
            to="/loan?promo=freeInterest"
            className="btn-primary text-lg md:text-xl px-10 py-4 shadow-xl shadow-primary-800/30 rounded-full transform hover:scale-105 transition-transform animate-fade-in-up" style={{ animationDelay: '0.2s' }}
          >
            {t('home.heroCTA')}
          </Link>
        </div>
        {/* Decorative wave */}
        <svg className="absolute bottom-0 left-0 w-full h-10 text-white" viewBox="0 0 1440 40" preserveAspectRatio="none">
          <path
            fill="currentColor"
            d="M0 0h1440v40H0z"
          />
        </svg>
      </section>

      {/* Stats */}
      <StatsSection />

      {/* Steps */}
      <StepsSection />

      {/* Advantages */}
      <section className="bg-gray-50/60 py-24">
        <div className="container grid md:grid-cols-3 gap-12">
          <div className="glass-card text-center md:text-left p-8 hover:-translate-y-1 hover:shadow-xl transition duration-300 animate-fade-in-up">
            <h3 className="text-xl font-semibold mb-3 text-primary-600 flex items-center justify-center md:justify-start gap-2">
              <span className="material-symbols-outlined text-3xl">shield_lock</span>
              {t('home.adv.secure')}
            </h3>
            <p className="text-gray-600 leading-relaxed max-w-xs mx-auto md:mx-0">
              {t('home.adv.secureDesc')}
            </p>
          </div>
          <div className="glass-card text-center md:text-left p-8 hover:-translate-y-1 hover:shadow-xl transition duration-300 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-xl font-semibold mb-3 text-primary-600 flex items-center justify-center md:justify-start gap-2">
              <span className="material-symbols-outlined text-3xl">bolt</span>
              {t('home.adv.fast')}
            </h3>
            <p className="text-gray-600 leading-relaxed max-w-xs mx-auto md:mx-0">
              {t('home.adv.fastDesc')}
            </p>
          </div>
          <div className="glass-card text-center md:text-left p-8 hover:-translate-y-1 hover:shadow-xl transition duration-300 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-xl font-semibold mb-3 text-primary-600 flex items-center justify-center md:justify-start gap-2">
              <span className="material-symbols-outlined text-3xl">sync_alt</span>
              {t('home.adv.flex')}
            </h3>
            <p className="text-gray-600 leading-relaxed max-w-xs mx-auto md:mx-0">
              {t('home.adv.flexDesc')}
            </p>
          </div>
        </div>
      </section>

      {/* Secondary CTA */}
      <SecondCTA />
    </div>
  );
}

export default Home; 