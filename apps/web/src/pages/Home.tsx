import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import StatsSection from '../components/Stats';
import StepsSection from '../components/Steps';
import SecondCTA from '../components/CTA2';
import TrustBadges from '../components/TrustBadges';
import Testimonials from '../components/Testimonials';

function Home() {
  const { t } = useTranslation();
  return (
    <div>
      {/* Hero */}
      <section className="pt-24 pb-20 bg-gradient-to-br from-primary-50 via-white to-primary-100 text-center relative overflow-hidden">
        {/* Subtle gradient grid pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-3 bg-[url('data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M40 39H0v1h40v-1ZM0 0v1h40V0H0Z\' fill=\'%23000\' fill-rule=\'evenodd\'/%3E%3C/svg%3E')]" />

        <div className="container relative z-10">
          {/* Trust indicator */}
          <div className="inline-flex items-center space-x-2 bg-success-50 border border-success-200 rounded-full px-4 py-2 mb-8 animate-slide-up">
            <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse-glow"></div>
            <span className="text-sm font-medium text-success-600">{t('home.trustIndicator')}</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight text-trust-900 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {t('home.heroTitle')}
          </h1>
          <p className="mb-8 text-lg md:text-xl text-trust-600 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {t('home.heroSubtitle')}
          </p>
          
          {/* Value props */}
          <div className="flex flex-wrap justify-center gap-6 mb-10 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center space-x-2 text-trust-700">
              <svg className="w-5 h-5 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">{t('home.benefits.noHiddenFees')}</span>
            </div>
            <div className="flex items-center space-x-2 text-trust-700">
              <svg className="w-5 h-5 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">{t('home.benefits.instantApproval')}</span>
            </div>
            <div className="flex items-center space-x-2 text-trust-700">
              <svg className="w-5 h-5 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">{t('home.benefits.bankGrade')}</span>
            </div>
          </div>
          
          <Link
            to="/loan?promo=freeInterest"
            className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white text-lg font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 animate-slide-up" style={{ animationDelay: '0.4s' }}
          >
            {t('home.heroCTA')}
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Trust Badges */}
      <TrustBadges />
      
      {/* Stats */}
      <StatsSection />

      {/* Steps */}
      <StepsSection />

      {/* Testimonials */}
      <Testimonials />
      
      {/* Advantages */}
      <section className="bg-trust-50 py-24">
        <div className="container grid md:grid-cols-3 gap-12">
          <div className="bg-white border border-trust-100 rounded-xl text-center md:text-left p-8 hover:-translate-y-1 hover:shadow-lg transition duration-300 animate-slide-up">
            <h3 className="text-xl font-semibold mb-3 text-primary-600 flex items-center justify-center md:justify-start gap-2">
              <span className="material-symbols-outlined text-3xl">shield_lock</span>
              {t('home.adv.secure')}
            </h3>
            <p className="text-trust-600 leading-relaxed max-w-xs mx-auto md:mx-0">
              {t('home.adv.secureDesc')}
            </p>
          </div>
          <div className="bg-white border border-trust-100 rounded-xl text-center md:text-left p-8 hover:-translate-y-1 hover:shadow-lg transition duration-300 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-xl font-semibold mb-3 text-primary-600 flex items-center justify-center md:justify-start gap-2">
              <span className="material-symbols-outlined text-3xl">bolt</span>
              {t('home.adv.fast')}
            </h3>
            <p className="text-trust-600 leading-relaxed max-w-xs mx-auto md:mx-0">
              {t('home.adv.fastDesc')}
            </p>
          </div>
          <div className="bg-white border border-trust-100 rounded-xl text-center md:text-left p-8 hover:-translate-y-1 hover:shadow-lg transition duration-300 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-xl font-semibold mb-3 text-primary-600 flex items-center justify-center md:justify-start gap-2">
              <span className="material-symbols-outlined text-3xl">sync_alt</span>
              {t('home.adv.flex')}
            </h3>
            <p className="text-trust-600 leading-relaxed max-w-xs mx-auto md:mx-0">
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