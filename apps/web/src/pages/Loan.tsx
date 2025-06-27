import { useTranslation } from 'react-i18next';

function Loan() {
  const { t } = useTranslation();
  return (
    <section className="container mx-auto py-16 px-4">
      <h2 className="text-3xl font-bold mb-6">{t('loan.title')}</h2>
      <p className="mb-4 text-gray-700">{t('loan.desc')}</p>
      {/* TODO: Step wizard implementation */}
      <div className="border p-6 rounded bg-gray-50 text-gray-500">
        {t('loan.wip')}
      </div>
    </section>
  );
}

export default Loan; 