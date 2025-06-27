import { useTranslation } from 'react-i18next';

function Register() {
  const { t } = useTranslation();
  return (
    <section className="container mx-auto py-16 px-4 max-w-md">
      <h2 className="text-3xl font-bold mb-6 text-center">{t('register.title')}</h2>
      {/* TODO: Register form */}
      <div className="border p-6 rounded bg-gray-50 text-gray-500 text-center">
        {t('register.wip')}
      </div>
    </section>
  );
}

export default Register; 