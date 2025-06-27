import { useTranslation } from 'react-i18next';
import { FaFileAlt, FaUserCheck, FaMoneyBillWave } from 'react-icons/fa';

const steps = [
  { icon: FaFileAlt, titleKey: 'home.steps.step1', descKey: 'home.steps.desc1' },
  { icon: FaUserCheck, titleKey: 'home.steps.step2', descKey: 'home.steps.desc2' },
  { icon: FaMoneyBillWave, titleKey: 'home.steps.step3', descKey: 'home.steps.desc3' },
];

export default function StepsSection() {
  const { t } = useTranslation();
  return (
    <section className="py-24 bg-gradient-to-b from-white via-gray-50 to-white">
      <div className="container text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text animate-fade-in-up">
          {t('home.steps.title')}
        </h2>
        <p className="text-gray-600 max-w-xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          {t('home.steps.subtitle')}
        </p>
      </div>
      <div className="container grid md:grid-cols-3 gap-12">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className="glass-card p-10 text-center flex flex-col items-center hover:-translate-y-1 transition animate-fade-in-up"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary-50 text-primary-600 mb-6 shadow">
                <Icon size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-primary-600">
                {t(s.titleKey)}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {t(s.descKey)}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
} 