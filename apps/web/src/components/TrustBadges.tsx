import { useTranslation } from 'react-i18next';

const TrustBadges = () => {
  const { t } = useTranslation();

  const badges = [
    { icon: '🔒', titleKey: 'trust.ssl.title', descKey: 'trust.ssl.desc' },
    { icon: '🏦', titleKey: 'trust.bank.title', descKey: 'trust.bank.desc' },
    { icon: '✅', titleKey: 'trust.verified.title', descKey: 'trust.verified.desc' },
    { icon: '🎯', titleKey: 'trust.precision.title', descKey: 'trust.precision.desc' },
  ];

  return (
    <section className="py-20 bg-slate-50">
      <div className="container text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4 animate-slide-up">
          {t('trust.title')}
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {t('trust.subtitle')}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
          {badges.map((badge, index) => (
            <div
              key={index}
              className="text-center p-6 bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow animate-slide-up"
              style={{ animationDelay: `${0.2 + index * 0.1}s` }}
            >
              <div className="text-4xl mb-3">{badge.icon}</div>
              <h3 className="font-semibold text-slate-800 mb-2">{t(badge.titleKey)}</h3>
              <p className="text-sm text-slate-600">{t(badge.descKey)}</p>
            </div>
          ))}
        </div>

        {/* Subtitle indicators */}
        <div className="inline-flex items-center space-x-6 text-sm text-slate-500">
          <span>SSL 256位加密</span>
          <span>•</span>
          <span>银行级安全</span>
          <span>•</span>
          <span>合规认证</span>
        </div>
      </div>
    </section>
  );
};

export default TrustBadges; 