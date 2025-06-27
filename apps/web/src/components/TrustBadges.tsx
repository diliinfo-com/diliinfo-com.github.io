import { useTranslation } from 'react-i18next';
import { HiShieldCheck, HiLockClosed, HiCurrencyDollar, HiAcademicCap } from 'react-icons/hi';

const badges = [
  { icon: HiShieldCheck, titleKey: 'trust.badges.secure', descKey: 'trust.badges.secureDesc' },
  { icon: HiLockClosed, titleKey: 'trust.badges.encrypted', descKey: 'trust.badges.encryptedDesc' },
  { icon: HiCurrencyDollar, titleKey: 'trust.badges.insured', descKey: 'trust.badges.insuredDesc' },
  { icon: HiAcademicCap, titleKey: 'trust.badges.regulated', descKey: 'trust.badges.regulatedDesc' },
];

export default function TrustBadges() {
  const { t } = useTranslation();
  
  return (
    <section className="py-20 bg-trust-50">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-trust-800 mb-4 animate-slide-up">
            {t('trust.title')}
          </h2>
          <p className="text-trust-600 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {t('trust.subtitle')}
          </p>
        </div>
        
        <div className="grid md:grid-cols-4 gap-8">
          {badges.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div 
                key={idx}
                className="text-center p-6 bg-white rounded-xl shadow-sm border border-trust-100 hover:shadow-md transition-shadow animate-slide-up"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-primary-50 rounded-full flex items-center justify-center">
                  <Icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="font-semibold text-trust-800 mb-2">{t(badge.titleKey)}</h3>
                <p className="text-sm text-trust-600">{t(badge.descKey)}</p>
              </div>
            );
          })}
        </div>
        
        {/* Regulatory info */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-6 text-sm text-trust-500">
            <span>CNBV Autorizada</span>
            <span>•</span>
            <span>SSL 256-bit Encryption</span>
            <span>•</span>
            <span>FDIC Insured</span>
          </div>
        </div>
      </div>
    </section>
  );
} 