import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { getApiUrl } from '../config/api';
import { trackLogin } from '../utils/analytics';
import { enhancedFetch, safeLocalStorage } from '../utils/enhancedBrowserCompat';


const Login: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isAdminLogin ? '/api/admin/auth/login' : '/api/auth/login';
      const payload = isAdminLogin 
        ? { username: formData.username, password: formData.password }
        : { email: formData.email, password: formData.password };

      const response = await enhancedFetch(getApiUrl(endpoint), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        safeLocalStorage.set('token', data.token);
        if (isAdminLogin) {
          safeLocalStorage.set('admin', JSON.stringify(data.admin));
          navigate('/admin');
        } else {
          // 追踪用户登录事件
          await trackLogin('web');
          safeLocalStorage.set('user', JSON.stringify(data.user));
          navigate('/user-center');
        }
      } else {
        setError(data.error || '登录失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">
            {t('auth.login.title')}
          </h2>
          <p className="text-slate-600">
            {isAdminLogin ? t('auth.login.adminSubtitle') : t('auth.login.subtitle')}
          </p>
        </div>

        <div className="mt-8 flex bg-slate-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setIsAdminLogin(false)}
            className={`
              flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all
              ${!isAdminLogin 
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
              }
            `}
          >
            {t('auth.tabs.user')}
          </button>
          <button
            type="button"
            onClick={() => setIsAdminLogin(true)}
            className={`
              flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all
              ${isAdminLogin 
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
              }
            `}
          >
            {t('auth.tabs.admin')}
          </button>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <div className="space-y-4">
            {isAdminLogin ? (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-slate-800 mb-2">
                  {t('auth.register.firstName')}
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="relative block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
            ) : (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-800 mb-2">
                  {t('auth.login.email')}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="relative block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-800 mb-2">
                {t('auth.login.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="relative block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? t('auth.login.loading') : t('auth.login.button')}
          </button>

          {!isAdminLogin && (
            <div className="text-center">
              <span className="text-slate-600 text-sm">
                {t('auth.login.noAccount')}
              </span>
              <Link
                to="/register"
                className="font-medium text-blue-600 hover:text-blue-500 ml-1"
              >
                {t('auth.login.register')}
              </Link>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login; 