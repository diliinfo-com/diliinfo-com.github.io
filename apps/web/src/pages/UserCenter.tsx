import { useTranslation } from 'react-i18next';

function UserCenter() {
  const { t } = useTranslation();
  return (
    <section className="container mx-auto py-16 px-4">
      <h2 className="text-3xl font-bold mb-6">{t('user.title')}</h2>
      {/* TODO: display application list */}
      <div className="border p-6 rounded bg-gray-50 text-gray-500">
        {t('user.wip')}
      </div>
    </section>
  );
}

export default UserCenter; 