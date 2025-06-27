import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { HiOutlineMenu, HiOutlineX } from 'react-icons/hi';

function Navbar() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 bg-white/70 backdrop-blur-md z-50 shadow-sm">
      <div className="container flex justify-between items-center h-16">
        <Link to="/" className="text-2xl font-bold text-primary-600 tracking-wide">
          diliinfo
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center space-x-10 text-sm font-medium">
          <NavLinks t={t} />
          <Link to="/loan" className="btn-primary px-5 py-2 rounded-full text-sm shadow">
            {t('home.heroCTA')}
          </Link>
        </nav>

        {/* Mobile button */}
        <button
          className="md:hidden p-2 text-primary-600"
          onClick={() => setOpen(!open)}
          aria-label="menu"
        >
          {open ? <HiOutlineX size={24} /> : <HiOutlineMenu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white/95 backdrop-blur pb-6 shadow-inner">
          <nav className="container flex flex-col gap-4 text-base pt-4">
            <NavLinks t={t} onClick={() => setOpen(false)} />
            <Link
              to="/loan"
              className="btn-primary text-center rounded-full py-3"
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
      <Link to="/about" className="hover:text-primary-600" onClick={onClick}>
        {t('nav.about')}
      </Link>
      <Link to="/loan" className="hover:text-primary-600" onClick={onClick}>
        {t('nav.loan')}
      </Link>
      <Link to="/user" className="hover:text-primary-600" onClick={onClick}>
        {t('nav.userCenter')}
      </Link>
    </>
  );
}

export default Navbar; 