import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { HiOutlineMenu, HiOutlineX } from 'react-icons/hi';

function Navbar() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 bg-white/95 backdrop-blur-md z-50 border-b border-trust-100">
      <div className="container flex justify-between items-center h-16">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">D</span>
          </div>
          <span className="text-xl font-bold text-trust-800 tracking-wide">diliinfo</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <NavLinks t={t} />
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-trust-600 hover:text-primary-600 transition-colors">
              {t('nav.login')}
            </Link>
            <Link to="/loan" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all">
              {t('home.heroCTA')}
            </Link>
          </div>
        </nav>

        {/* Mobile button */}
        <button
          className="md:hidden p-2 text-trust-600"
          onClick={() => setOpen(!open)}
          aria-label="menu"
        >
          {open ? <HiOutlineX size={20} /> : <HiOutlineMenu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-b border-trust-100">
          <nav className="container flex flex-col gap-4 text-base py-6">
            <NavLinks t={t} onClick={() => setOpen(false)} />
            <Link
              to="/login"
              className="text-trust-600 py-2"
              onClick={() => setOpen(false)}
            >
              {t('nav.login')}
            </Link>
            <Link
              to="/loan"
              className="bg-primary-600 text-white text-center py-3 rounded-lg font-semibold"
              onClick={() => setOpen(false)}
            >
              {t('home.heroCTA')}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

function NavLinks({ t, onClick }: { t: any; onClick?: () => void }) {
  return (
    <>
      <Link to="/about" className="text-trust-600 hover:text-primary-600 transition-colors" onClick={onClick}>
        {t('nav.about')}
      </Link>
      <Link to="/user" className="text-trust-600 hover:text-primary-600 transition-colors" onClick={onClick}>
        {t('nav.userCenter')}
      </Link>
    </>
  );
}

export default Navbar; 