import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <header className="fixed top-0 inset-x-0 bg-white/95 backdrop-blur-md z-50 border-b border-slate-200">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3">
            <span className="text-xl font-bold text-slate-800 tracking-wide">diliinfo</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/about" className="text-slate-600 hover:text-blue-600 transition-colors">
              {t('nav.about')}
            </Link>
            <Link to="/services" className="text-slate-600 hover:text-blue-600 transition-colors">
              {t('nav.services')}
            </Link>
            <Link to="/contact" className="text-slate-600 hover:text-blue-600 transition-colors">
              {t('nav.contact')}
            </Link>
            <Link to="/login" className="text-slate-600 hover:text-blue-600 transition-colors">
              {t('nav.login')}
            </Link>
            <Link
              to="/loan"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {t('nav.apply')}
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-slate-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden bg-white border-b border-slate-200">
            <nav className="px-2 pt-2 pb-4 space-y-1">
              <Link
                to="/about"
                className="text-slate-600 py-2"
                onClick={() => setIsOpen(false)}
              >
                {t('nav.about')}
              </Link>
              <Link
                to="/services"
                className="block px-3 py-2 text-slate-600 hover:text-blue-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {t('nav.services')}
              </Link>
              <Link
                to="/contact"
                className="block px-3 py-2 text-slate-600 hover:text-blue-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {t('nav.contact')}
              </Link>
              <Link to="/about" className="text-slate-600 hover:text-blue-600 transition-colors" onClick={() => setIsOpen(false)}>
                {t('nav.about')}
              </Link>
              <Link to="/user" className="text-slate-600 hover:text-blue-600 transition-colors" onClick={() => setIsOpen(false)}>
                {t('nav.userCenter')}
              </Link>
              <Link
                to="/loan"
                className="block bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-medium transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {t('nav.apply')}
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar; 