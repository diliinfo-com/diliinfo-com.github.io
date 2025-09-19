import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function NavbarNew() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* 引入设计系统样式 */}
      <link rel="stylesheet" href="/src/styles/design-system.css" />
      
      <nav className="bg-white shadow-sm border-b border-slate-200 fixed top-0 left-0 right-0 z-50">
        <div className="dili-container">
          <div className="flex justify-between items-center h-16">
            {/* Logo - 专业金融风格 */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center shadow-sm">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-slate-900">DiliInfo</span>
                <span className="text-xs text-slate-600 -mt-1">Financial Services</span>
              </div>
            </Link>

            {/* Desktop Menu - 简洁专业 */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className={`text-sm font-medium transition-all duration-200 pb-1 ${
                  isActive('/') 
                    ? 'text-slate-800 border-b-2 border-slate-800' 
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                {t('nav.home')}
              </Link>
              <Link
                to="/about"
                className={`text-sm font-medium transition-all duration-200 pb-1 ${
                  isActive('/about') 
                    ? 'text-slate-800 border-b-2 border-slate-800' 
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                {t('nav.about')}
              </Link>
              
              {/* 安全认证标识 */}
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-medium text-green-700">SSL Seguro</span>
              </div>

              <Link
                to="/loan"
                className="dili-button dili-button--primary"
              >
                Solicitar Ahora
              </Link>

            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-3">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-slate-700 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:ring-offset-2 rounded-md"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu - 优化移动端体验 */}
          {isOpen && (
            <div className="md:hidden border-t border-slate-200">
              <div className="py-4 space-y-2 bg-white">
                <Link
                  to="/"
                  className={`block px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                    isActive('/') 
                      ? 'text-slate-800 bg-slate-50 border-l-4 border-slate-800' 
                      : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {t('nav.home')}
                </Link>
                <Link
                  to="/about"
                  className={`block px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                    isActive('/about') 
                      ? 'text-slate-800 bg-slate-50 border-l-4 border-slate-800' 
                      : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {t('nav.about')}
                </Link>
                
                {/* 移动端安全标识 */}
                <div className="px-4 py-2">
                  <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs font-medium text-green-700">Proceso 100% Seguro</span>
                  </div>
                </div>

                <div className="px-4 pt-2">
                  <Link
                    to="/loan"
                    className="dili-button dili-button--primary w-full justify-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Solicitar Ahora
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}

export default NavbarNew;