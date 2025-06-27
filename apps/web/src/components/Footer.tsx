import { useTranslation } from 'react-i18next';

function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container py-10 text-sm text-gray-500 text-center md:text-left flex flex-col md:flex-row justify-between gap-6">
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">diliinfo</h4>
          <p>© 2024 diliinfo. {t('footer.rights')}</p>
        </div>
        <div className="flex items-center justify-center gap-4 text-gray-400">
          <a href="#" className="hover:text-primary-600 transition-colors">Privacy</a>
          <a href="#" className="hover:text-primary-600 transition-colors">Terms</a>
          <a href="#" className="hover:text-primary-600 transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 