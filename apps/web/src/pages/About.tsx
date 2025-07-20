import { useTranslation } from 'react-i18next';

function About() {
  const { t } = useTranslation();

  const values = [
    {
      key: 'transparency',
      icon: '🔍'
    },
    {
      key: 'innovation', 
      icon: '💡'
    },
    {
      key: 'responsibility',
      icon: '🛡️'
    },
    {
      key: 'security',
      icon: '🔒'
    }
  ];

  const teamExpertise = [
    { key: 'fintech', icon: '💰' },
    { key: 'banking', icon: '🏦' },
    { key: 'tech', icon: '💻' },
    { key: 'support', icon: '👥' }
  ];

  const commitmentPoints = [
    { key: 'local', icon: '🇲🇽' },
    { key: 'education', icon: '📚' },
    { key: 'inclusion', icon: '🤝' },
    { key: 'regulation', icon: '📋' }
  ];

  const recognitionItems = [
    { key: 'cnbv', icon: '🏛️' },
    { key: 'ssl', icon: '🔐' },
    { key: 'iso', icon: '📜' },
    { key: 'pci', icon: '💳' }
  ];

  const futurePlans = [
    { key: 'products', icon: '🚀' },
    { key: 'ai', icon: '🤖' },
    { key: 'education', icon: '🎓' },
    { key: 'partnerships', icon: '🤝' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">{t('about.title')}</h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">{t('about.subtitle')}</p>
          <p className="text-lg max-w-4xl mx-auto leading-relaxed">{t('about.desc')}</p>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Mission */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">{t('about.mission')}</h3>
              <p className="text-gray-600 leading-relaxed">{t('about.missionDesc')}</p>
            </div>

            {/* Vision */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👁️</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">{t('about.vision')}</h3>
              <p className="text-gray-600 leading-relaxed">{t('about.visionDesc')}</p>
            </div>

            {/* Values Preview */}
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">{t('about.values')}</h3>
              <p className="text-gray-600 leading-relaxed">{t('about.valuesDesc')}</p>
            </div>
          </div>

          {/* Values Detail */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div key={value.key} className="bg-gray-50 p-6 rounded-lg text-center hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-3">{value.icon}</div>
                <h4 className="text-xl font-semibold mb-3 text-gray-800">{t(`about.${value.key}.title`)}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{t(`about.${value.key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">{t('about.story.title')}</h2>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <p className="text-gray-700 leading-relaxed mb-6 text-lg">{t('about.story.desc')}</p>
              <p className="text-gray-700 leading-relaxed text-lg">{t('about.story.growth')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">{t('about.team.title')}</h2>
          <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto text-lg">{t('about.team.desc')}</p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamExpertise.map((expertise) => (
              <div key={expertise.key} className="text-center p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-4">{expertise.icon}</div>
                <p className="text-gray-700 leading-relaxed">{t(`about.team.expertise.${expertise.key}`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commitment to Mexico */}
      <section className="py-16 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">{t('about.commitment.title')}</h2>
          <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto text-lg">{t('about.commitment.desc')}</p>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {commitmentPoints.map((point) => (
              <div key={point.key} className="flex items-start space-x-4 bg-white p-6 rounded-lg shadow">
                <div className="text-2xl">{point.icon}</div>
                <p className="text-gray-700 leading-relaxed">{t(`about.commitment.points.${point.key}`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recognition */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">{t('about.recognition.title')}</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recognitionItems.map((item) => (
              <div key={item.key} className="text-center p-6 border-2 border-blue-100 rounded-lg hover:border-blue-300 transition-colors">
                <div className="text-3xl mb-4">{item.icon}</div>
                <p className="text-gray-700 leading-relaxed text-sm">{t(`about.recognition.items.${item.key}`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Future Plans */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">{t('about.future.title')}</h2>
          <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto text-lg">{t('about.future.desc')}</p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {futurePlans.map((plan) => (
              <div key={plan.key} className="bg-white p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow">
                <div className="text-3xl mb-4">{plan.icon}</div>
                <p className="text-gray-700 leading-relaxed">{t(`about.future.plans.${plan.key}`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">¿Listo para unirte a nuestra historia?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Forma parte de la revolución financiera en México. Obtén tu préstamo de manera rápida, segura y transparente.
          </p>
          <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
            Solicitar Préstamo
          </button>
        </div>
    </section>
    </div>
  );
}

export default About; 