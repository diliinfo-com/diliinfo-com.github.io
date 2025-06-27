import { useTranslation } from 'react-i18next';

function Login() {
  const { t } = useTranslation();
  return (
    <section className="container mx-auto py-16 px-4 max-w-md">
      <h2 className="text-3xl font-bold mb-6 text-center">{t('login.title')}</h2>
      {/* TODO: Login form */}
      <div className="border p-6 rounded bg-gray-50 text-gray-500 text-center">
        {t('login.wip')}
      </div>
    </section>
  );
}

export default Login; 