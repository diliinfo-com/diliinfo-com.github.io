import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getApiUrl } from '../config/api';
import { httpClient, checkBrowserCompatibility } from '../utils/httpClient';
import { safeStorage, safeDateParse, arrayCompat, smoothScroll } from '../utils/browserCompat';
import MobileFix from './MobileFix';

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
  onNext: () => Promise<void>;
  onBack: () => void;
  updateApplicationStep?: (step: number, stepData: any) => Promise<void>;
  isSavingStep: boolean;
}

// 第1步：用户注册
const Step1UserRegistration: React.FC<StepProps> = ({ data, onUpdate, onNext, updateApplicationStep, isSavingStep }) => {
  const { t } = useTranslation();
  const [phone, setPhone] = useState(data.phone || '');
  const [countryCode, setCountryCode] = useState('+52');
  const [showApprovedAmount, setShowApprovedAmount] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const countryCodes = [
    // 拉丁美洲国家（优先显示）
    { code: '+52', name: 'México', flag: '🇲🇽' },
    { code: '+1', name: 'Estados Unidos', flag: '🇺🇸' },
    { code: '+1', name: 'Canadá', flag: '🇨🇦' },
    { code: '+54', name: 'Argentina', flag: '🇦🇷' },
    { code: '+55', name: 'Brasil', flag: '🇧🇷' },
    { code: '+56', name: 'Chile', flag: '🇨🇱' },
    { code: '+57', name: 'Colombia', flag: '🇨🇴' },
    { code: '+58', name: 'Venezuela', flag: '🇻🇪' },
    { code: '+51', name: 'Perú', flag: '🇵🇪' },
    { code: '+593', name: 'Ecuador', flag: '🇪🇨' },
    { code: '+591', name: 'Bolivia', flag: '🇧🇴' },
    { code: '+595', name: 'Paraguay', flag: '🇵🇾' },
    { code: '+598', name: 'Uruguay', flag: '🇺🇾' },
    { code: '+506', name: 'Costa Rica', flag: '🇨🇷' },
    { code: '+507', name: 'Panamá', flag: '🇵🇦' },
    { code: '+503', name: 'El Salvador', flag: '🇸🇻' },
    { code: '+502', name: 'Guatemala', flag: '🇬🇹' },
    { code: '+504', name: 'Honduras', flag: '🇭🇳' },
    { code: '+505', name: 'Nicaragua', flag: '🇳🇮' },
    { code: '+53', name: 'Cuba', flag: '🇨🇺' },
    { code: '+1', name: 'República Dominicana', flag: '🇩🇴' },

    // 欧洲国家
    { code: '+34', name: 'España', flag: '🇪🇸' },
    { code: '+44', name: 'Reino Unido', flag: '🇬🇧' },
    { code: '+33', name: 'Francia', flag: '🇫🇷' },
    { code: '+49', name: 'Alemania', flag: '🇩🇪' },
    { code: '+39', name: 'Italia', flag: '🇮🇹' },
    { code: '+351', name: 'Portugal', flag: '🇵🇹' },
    { code: '+31', name: 'Países Bajos', flag: '🇳🇱' },
    { code: '+41', name: 'Suiza', flag: '🇨🇭' },
    { code: '+43', name: 'Austria', flag: '🇦🇹' },
    { code: '+32', name: 'Bélgica', flag: '🇧🇪' },

    // 亚洲国家
    { code: '+86', name: 'China', flag: '🇨🇳' },
    { code: '+81', name: 'Japón', flag: '🇯🇵' },
    { code: '+82', name: 'Corea del Sur', flag: '🇰🇷' },
    { code: '+91', name: 'India', flag: '🇮🇳' },
    { code: '+65', name: 'Singapur', flag: '🇸🇬' },
    { code: '+60', name: 'Malasia', flag: '🇲🇾' },
    { code: '+66', name: 'Tailandia', flag: '🇹🇭' },
    { code: '+84', name: 'Vietnam', flag: '🇻🇳' },
    { code: '+63', name: 'Filipinas', flag: '🇵🇭' },
    { code: '+62', name: 'Indonesia', flag: '🇮🇩' },

    // 其他重要国家
    { code: '+61', name: 'Australia', flag: '🇦🇺' },
    { code: '+64', name: 'Nueva Zelanda', flag: '🇳🇿' },
    { code: '+27', name: 'Sudáfrica', flag: '🇿🇦' },
    { code: '+20', name: 'Egipto', flag: '🇪🇬' },
    { code: '+971', name: 'Emiratos Árabes Unidos', flag: '🇦🇪' },
    { code: '+966', name: 'Arabia Saudí', flag: '🇸🇦' },
    { code: '+972', name: 'Israel', flag: '🇮🇱' },
    { code: '+90', name: 'Turquía', flag: '🇹🇷' },
    { code: '+7', name: 'Rusia', flag: '🇷🇺' }
  ];

  const persistRegistrationStep = async (payload: any) => {
    if (!updateApplicationStep) {
      return true;
    }

    try {
      await updateApplicationStep(1, payload);
      return true;
    } catch (error) {
      console.error('Failed to persist registration step:', error);
      alert(t('errors.networkOffline'));
      return false;
    }
  };

  const handleCheckEligibility = async () => {
    if (!phone) {
      alert(t('errors.phoneRequired'));
      return;
    }

    const fullPhone = countryCode + phone;
    setIsRegistering(true);

    try {
      // 直接进行用户注册（无需验证码）
      console.log('📱 Registering user with phone:', fullPhone);
      
      // 调用verify-sms接口进行用户注册，使用固定验证码
      const result = await httpClient.postJson('/api/auth/verify-sms', {
        phone: fullPhone,
        code: '123456', // 使用固定验证码
        applicationId: data.id
      }) as { 
        success: boolean; 
        error?: string; 
        user?: { id: string; phone: string; phone_verified: boolean };
        token?: string;
        applicationId?: string;
      };

      console.log('✅ User registration result:', result);

      if (result.success) {
        // 显示审批金额
        setShowApprovedAmount(true);
        
        // 用户已注册，申请已转换
        const updatedData = {
          phone: fullPhone,
          isGuest: false, // 现在是注册用户
          id: data.id,
          userId: result.user?.id
        };
        onUpdate(updatedData);

        await persistRegistrationStep({ 
          phone: fullPhone, 
          registered: true,
          verified: true,
          userId: result.user?.id
        });

        console.log('✅ User registered successfully');
      } else {
        // 如果注册失败，仍然显示审批金额，但保持访客状态
        setShowApprovedAmount(true);
        const updatedData = {
          phone: fullPhone,
          isGuest: true,
          id: data.id
        };
        onUpdate(updatedData);
        
        await persistRegistrationStep({ 
          phone: fullPhone, 
          registered: false,
          verified: false
        });
      }
    } catch (error) {
      console.error('❌ Failed to register user:', error);
      // 如果注册失败，仍然显示审批金额，但保持访客状态
      setShowApprovedAmount(true);
      const updatedData = {
        phone: fullPhone,
        isGuest: true,
        id: data.id
      };
      onUpdate(updatedData);
      
      await persistRegistrationStep({ 
        phone: fullPhone, 
        registered: false,
        verified: false
      });
    } finally {
      setIsRegistering(false);
    }

  };

  const handleContinue = async () => {
    try {
      await onNext();
    } catch (error) {
      console.error('Failed to continue to next step:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 overflow-x-hidden">
      {/* 安全认证条 */}
      <div className="bg-slate-800 text-white py-2 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-center text-sm">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span className="text-slate-300">SSL Encriptado</span>
            </div>
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-slate-300">Autorizado CNBV</span>
            </div>
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-slate-300">Datos Protegidos</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8 lg:py-12 max-w-full overflow-hidden">
        <div className="max-w-2xl mx-auto w-full">
          {/* 主标题区域 */}
          <div className="text-center mb-8 lg:mb-12">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-3">
              ¡Préstamos con Interés Bajo!
            </h1>
            <p className="text-slate-600 text-base lg:text-lg leading-relaxed">
              Ingresa tu número de teléfono para ver tu límite de crédito aprobado
            </p>
            <div className="mt-4 text-sm text-slate-500">
              Su información será protegida con encriptación de grado bancario
            </div>
          </div>

          {/* 表单卡片 */}
          <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
            <div className="p-2 sm:p-4 md:p-6 lg:p-8">
              {!showApprovedAmount ? (
                <div className="space-y-4 sm:space-y-6">
                  {/* 手机号输入 */}
                  <div>
                    <label className="block text-sm sm:text-base font-semibold text-slate-800 mb-2 sm:mb-3">
                      {t('loanWizard.step1.phoneLabel')}
                    </label>
                    <div className="flex w-full max-w-full overflow-hidden">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="w-14 sm:w-16 md:w-20 lg:w-24 px-1 sm:px-2 py-2 sm:py-3 border border-slate-300 border-r-0 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800 transition-colors text-xs sm:text-sm flex-shrink-0 rounded-l-lg"
                        disabled={showApprovedAmount}
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
                        placeholder={t('loanWizard.step1.phonePlaceholder')}
                        className="flex-1 min-w-0 w-0 px-2 sm:px-3 py-2 sm:py-3 border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800 transition-colors text-sm sm:text-base rounded-r-lg"
                        disabled={showApprovedAmount}
                      />
                    </div>
                    <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-500">
                      Verificaremos su número para procesar su solicitud
                    </div>
                  </div>

                  {/* 提交按钮 */}
                  <button
                    onClick={handleCheckEligibility}
                    disabled={!phone || isRegistering}
                    className="w-full py-3 sm:py-4 bg-slate-800 text-white font-semibold text-base sm:text-lg rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
                  >
                    {isRegistering ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Procesando solicitud...
                      </div>
                    ) : (
                      'Ver Mi Límite de Crédito'
                    )}
                  </button>

                  {/* 安全提示 */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-slate-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <h4 className="font-semibold text-slate-800 text-sm mb-1">Información Segura</h4>
                        <p className="text-slate-600 text-sm leading-relaxed">
                          Sus datos personales están protegidos con tecnología de encriptación SSL de 256 bits, 
                          el mismo estándar utilizado por los bancos más importantes.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* 结果展示 */}
                  <div className="text-center py-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                      <svg className="w-8 h-8 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                      ¡Felicidades! Tu límite de crédito es:
                    </h3>
                    <div className="text-4xl lg:text-5xl font-bold text-emerald-600 mb-2">
                      $50,000 <span className="text-2xl lg:text-3xl text-slate-600">MXN</span>
                    </div>
                    <p className="text-slate-600">
                      Préstamo con interés bajo disponible ahora
                    </p>
                    {!data.isGuest && data.userId && (
                      <div className="mt-3 inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-medium rounded-full">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Usuario registrado exitosamente
                      </div>
                    )}
                  </div>
                  
                  {/* 优势展示 */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                    <h4 className="font-semibold text-slate-800 text-lg mb-4">Beneficios de tu préstamo:</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-slate-800 rounded-full"></div>
                        <span className="text-slate-700">Tasa de interés baja: 15% OFF</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-slate-800 rounded-full"></div>
                        <span className="text-slate-700">Hasta 100,000 pesos de crédito</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-slate-800 rounded-full"></div>
                        <span className="text-slate-700">Sin comisión de procesamiento</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-slate-800 rounded-full"></div>
                        <span className="text-slate-700">Pago anticipado sin penalización</span>
                      </div>
                    </div>
                  </div>

                  {/* 继续按钮 */}
                  <button
                    onClick={handleContinue}
                    disabled={isSavingStep}
                    className="w-full py-4 bg-slate-800 text-white font-semibold text-lg rounded-lg hover:bg-slate-700 transition-colors shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSavingStep ? t('common.loading') : 'Continuar con mi Solicitud'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 底部信任标识 */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center space-x-8 text-sm text-slate-500">
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Regulado CNBV</span>
              </div>
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>Datos Seguros</span>
              </div>
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Proceso Transparente</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 第2步：身份信息
const Step2Identity: React.FC<StepProps> = ({ data, onUpdate, onNext, onBack, updateApplicationStep, isSavingStep }) => {
  const { t } = useTranslation();
  const [idNumber, setIdNumber] = useState(data.idNumber || '');
  const [realName, setRealName] = useState(data.realName || '');

  const handleNext = async () => {
    if (!idNumber || !realName) {
      alert(t('errors.required'));
      return;
    }
    const stepData = { idNumber, realName };
    onUpdate(stepData);
    try {
      if (updateApplicationStep) {
        await updateApplicationStep(2, stepData);
      }
      await onNext();
    } catch (error) {
      console.error('Failed to save identity step:', error);
      alert(t('errors.networkOffline'));
    }
  };

  return (
    <div className="p-2 sm:p-6 lg:p-8 w-full max-w-none sm:max-w-2xl mx-auto">
      <div className="mb-4 sm:mb-8">
        <div className="flex items-center space-x-2 sm:space-x-4 mb-3 sm:mb-6">
          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-slate-800 rounded-lg flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-['Source_Han_Sans_CN','PingFang_SC','Microsoft_YaHei',sans-serif]">
              Información de Identidad
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Completa tu información personal para continuar
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-1 sm:space-y-2">
          <label className="block text-xs sm:text-sm font-semibold text-slate-800 font-['Roboto','Helvetica_Neue',Arial,sans-serif]">
            Nombre completo <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={realName}
            onChange={(e) => setRealName(e.target.value)}
            placeholder="Ingresa tu nombre completo"
            className="w-full max-w-full px-2 sm:px-3 py-2 sm:py-2.5 border border-slate-300 rounded-sm text-sm font-['Roboto','Helvetica_Neue',Arial,sans-serif] focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent box-border"
          />
        </div>

        <div className="space-y-1 sm:space-y-2">
          <label className="block text-xs sm:text-sm font-semibold text-slate-800 font-['Roboto','Helvetica_Neue',Arial,sans-serif]">
            Número de identificación <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            placeholder="Ingresa tu número de identificación"
            className="w-full px-2 sm:px-3 py-2 sm:py-2.5 border border-slate-300 rounded-sm text-sm font-['Roboto','Helvetica_Neue',Arial,sans-serif] focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
            maxLength={18}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-slate-200 space-y-2 sm:space-y-0 sm:space-x-4">
        <button
          onClick={onBack}
          className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-sm hover:bg-slate-50 transition-colors duration-200 font-['Roboto','Helvetica_Neue',Arial,sans-serif] flex items-center justify-center space-x-2 text-sm"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>Anterior</span>
        </button>
        
        <button
          onClick={handleNext}
          disabled={isSavingStep}
          className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-sm transition-colors duration-200 font-['Roboto','Helvetica_Neue',Arial,sans-serif] flex items-center justify-center space-x-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span>{isSavingStep ? t('common.loading') : 'Siguiente'}</span>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// 第3步：身份证上传
const Step3IdUpload: React.FC<StepProps> = ({ onNext, onBack, updateApplicationStep, isSavingStep }) => {
  const { t } = useTranslation();
  const [frontUploaded, setFrontUploaded] = useState(false);
  const [backUploaded, setBackUploaded] = useState(false);
  const [frontUploading, setFrontUploading] = useState(false);
  const [backUploading, setBackUploading] = useState(false);
  const [frontFileName, setFrontFileName] = useState('');
  const [backFileName, setBackFileName] = useState('');

  const handleFileUpload = (type: 'front' | 'back', file: File) => {
    if (type === 'front') {
      setFrontUploading(true);
      setFrontFileName(file.name);
      // 模拟上传过程
      setTimeout(() => {
        setFrontUploading(false);
        setFrontUploaded(true);
        // 追踪文件上传事件
        trackFileUpload('id_front', 1);
      }, 2000);
    } else {
      setBackUploading(true);
      setBackFileName(file.name);
      // 模拟上传过程
      setTimeout(() => {
        setBackUploading(false);
        setBackUploaded(true);
        // 追踪文件上传事件
        trackFileUpload('id_back', 1);
      }, 2000);
    }
  };

  const handleFileSelect = (type: 'front' | 'back') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleFileUpload(type, file);
      }
    };
    input.click();
  };

  const handleNext = async () => {
    if (!frontUploaded || !backUploaded) {
      alert(t('errors.required'));
      return;
    }
    const stepData = { frontUploaded, backUploaded };
    try {
      if (updateApplicationStep) {
        await updateApplicationStep(3, stepData);
      }
      await onNext();
    } catch (error) {
      console.error('Failed to save ID upload step:', error);
      alert(t('errors.networkOffline'));
    }
  };

  return (
    <div className="p-3 sm:p-6 lg:p-8 w-full max-w-none sm:max-w-2xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-800 rounded-lg flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-['Source_Han_Sans_CN','PingFang_SC','Microsoft_YaHei',sans-serif]">
              Subir Identificación
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Sube fotos claras de tu identificación oficial
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <div className="space-y-4">
            <div className="text-4xl text-gray-400">📄</div>
            <div>
              <h4 className="font-medium">Frente de la identificación</h4>
              <p className="text-sm text-gray-500">Foto clara del frente de tu ID</p>
            </div>
            {frontUploaded ? (
              <div className="space-y-2">
                <div className="text-green-600">✓ {frontFileName}</div>
                <div className="text-xs text-gray-500">Subido exitosamente</div>
              </div>
            ) : frontUploading ? (
              <div className="space-y-2">
                <div className="text-blue-600">Subiendo...</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => handleFileSelect('front')}
                className="px-4 py-2 bg-slate-800 text-white rounded-sm hover:bg-slate-700 font-['Roboto','Helvetica_Neue',Arial,sans-serif]"
              >
                Subir Foto
              </button>
            )}
          </div>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <div className="space-y-4">
            <div className="text-4xl text-gray-400">📄</div>
            <div>
              <h4 className="font-medium">Reverso de la identificación</h4>
              <p className="text-sm text-gray-500">Foto clara del reverso de tu ID</p>
            </div>
            {backUploaded ? (
              <div className="space-y-2">
                <div className="text-green-600">✓ {backFileName}</div>
                <div className="text-xs text-gray-500">Subido exitosamente</div>
              </div>
            ) : backUploading ? (
              <div className="space-y-2">
                <div className="text-blue-600">Subiendo...</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => handleFileSelect('back')}
                className="px-4 py-2 bg-slate-800 text-white rounded-sm hover:bg-slate-700 font-['Roboto','Helvetica_Neue',Arial,sans-serif]"
              >
                Subir Foto
              </button>
            )}
          </div>
        </div>
      </div>

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
          onClick={handleNext}
          disabled={isSavingStep}
          className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-sm transition-colors duration-200 font-['Roboto','Helvetica_Neue',Arial,sans-serif] flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span>{isSavingStep ? t('common.loading') : 'Siguiente'}</span>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// 第4步：联系人信息
const Step4Contacts: React.FC<StepProps> = ({ data, onUpdate, onNext, onBack, updateApplicationStep, isSavingStep }) => {
  const { t } = useTranslation();
  const [contact1Name, setContact1Name] = useState(data.contact1Name || '');
  const [contact1Phone, setContact1Phone] = useState(data.contact1Phone || '');
  const [contact2Name, setContact2Name] = useState(data.contact2Name || '');
  const [contact2Phone, setContact2Phone] = useState(data.contact2Phone || '');

  const handleNext = async () => {
    if (!contact1Name || !contact1Phone || !contact2Name || !contact2Phone) {
      alert(t('errors.required'));
      return;
    }
    const stepData = { contact1Name, contact1Phone, contact2Name, contact2Phone };
    onUpdate(stepData);
    try {
      if (updateApplicationStep) {
        await updateApplicationStep(4, stepData);
      }
      await onNext();
    } catch (error) {
      console.error('Failed to save contacts step:', error);
      alert(t('errors.networkOffline'));
    }
  };

  return (
    <div className="p-3 sm:p-6 lg:p-8 w-full max-w-none sm:max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center shadow-sm">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12a1 1 0 01-.117-1.993L9 10h2a1 1 0 01.117 1.993L11 12H9zm4-6a1 1 0 01.117 1.993L13 8H7a1 1 0 01-.117-1.993L7 6h6z" />
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-['Source_Han_Sans_CN','PingFang_SC','Microsoft_YaHei',sans-serif]">
              Contactos de Referencia
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Proporciona dos contactos de referencia
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-4">Contacto de referencia 1</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-800 font-['Roboto','Helvetica_Neue',Arial,sans-serif]">
                Nombre completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={contact1Name}
                onChange={(e) => setContact1Name(e.target.value)}
                placeholder="Nombre del contacto"
                className="w-full max-w-full px-2 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-sm text-sm font-['Roboto','Helvetica_Neue',Arial,sans-serif] focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent box-border"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-800 font-['Roboto','Helvetica_Neue',Arial,sans-serif]">
                Número de teléfono <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={contact1Phone}
                onChange={(e) => setContact1Phone(e.target.value)}
                placeholder="Teléfono del contacto"
                className="w-full px-4 py-3 border border-slate-300 rounded-sm text-sm font-['Roboto','Helvetica_Neue',Arial,sans-serif] focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                maxLength={11}
              />
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-4">Contacto de referencia 2</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-800 font-['Roboto','Helvetica_Neue',Arial,sans-serif]">
                Nombre completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={contact2Name}
                onChange={(e) => setContact2Name(e.target.value)}
                placeholder="Nombre del contacto"
                className="w-full px-4 py-3 border border-slate-300 rounded-sm text-sm font-['Roboto','Helvetica_Neue',Arial,sans-serif] focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-800 font-['Roboto','Helvetica_Neue',Arial,sans-serif]">
                Número de teléfono <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={contact2Phone}
                onChange={(e) => setContact2Phone(e.target.value)}
                placeholder="Teléfono del contacto"
                className="w-full px-4 py-3 border border-slate-300 rounded-sm text-sm font-['Roboto','Helvetica_Neue',Arial,sans-serif] focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                maxLength={11}
              />
            </div>
          </div>
        </div>
      </div>

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
          onClick={handleNext}
          disabled={isSavingStep}
          className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-sm transition-colors duration-200 font-['Roboto','Helvetica_Neue',Arial,sans-serif] flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span>{isSavingStep ? t('common.loading') : 'Siguiente'}</span>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// 第5步：活体识别
const Step5LivenessDetection: React.FC<StepProps> = ({ onNext, onBack, updateApplicationStep, isSavingStep }) => {
  const { t } = useTranslation();
  const [videoUploaded, setVideoUploaded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [videoFileName, setVideoFileName] = useState('');
  const [showVideoOptions, setShowVideoOptions] = useState(false);

  const startRecording = () => {
    setIsRecording(true);
    // 模拟3秒录制
    setTimeout(() => {
      setIsRecording(false);
      setVideoUploaded(true);
      setVideoFileName('liveness_video_' + Date.now() + '.mp4');
    }, 3000);
  };

  const handleVideoUpload = (file: File) => {
    setIsUploading(true);
    setVideoFileName(file.name);
    // 模拟上传过程
    setTimeout(() => {
      setIsUploading(false);
      setVideoUploaded(true);
    }, 2000);
  };

  const handleVideoSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleVideoUpload(file);
      }
    };
    input.click();
  };

  const handleNext = async () => {
    if (!videoUploaded) {
      alert(t('errors.required'));
      return;
    }
    const stepData = { videoUploaded, videoFileName };
    try {
      if (updateApplicationStep) {
        await updateApplicationStep(5, stepData);
      }
      await onNext();
    } catch (error) {
      console.error('Failed to save liveness step:', error);
      alert(t('errors.networkOffline'));
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center shadow-sm">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-['Source_Han_Sans_CN','PingFang_SC','Microsoft_YaHei',sans-serif]">
              Verificación de Identidad
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Graba un video corto para verificar tu identidad
            </p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <div className="inline-block p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <div className="space-y-4">
            <div className="text-6xl">📹</div>
            <div>
              <h4 className="font-medium mb-2">Verificación de Identidad en Vivo</h4>
              <p className="text-sm text-gray-500 mb-4">
                Graba un video de 3 segundos mostrando tu rostro
              </p>
            </div>

            {videoUploaded ? (
              <div className="space-y-2">
                <div className="text-green-600">✓ {videoFileName}</div>
                <div className="text-xs text-gray-500">Verificación completada</div>
              </div>
            ) : isUploading ? (
              <div className="space-y-2">
                <div className="text-blue-600">Subiendo video...</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                </div>
              </div>
            ) : isRecording ? (
              <div className="space-y-2">
                <div className="text-blue-600">Grabando... Mantén tu rostro visible</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                </div>
              </div>
            ) : !showVideoOptions ? (
              <button
                onClick={() => setShowVideoOptions(true)}
                className="px-6 py-3 bg-slate-800 text-white rounded-sm hover:bg-slate-700 font-['Roboto','Helvetica_Neue',Arial,sans-serif]"
              >
                Iniciar Verificación
              </button>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={startRecording}
                  className="block w-full px-6 py-3 bg-slate-800 text-white rounded-sm hover:bg-slate-700 font-['Roboto','Helvetica_Neue',Arial,sans-serif]"
                >
                  Grabar Video
                </button>
                <div className="text-gray-500 text-sm">o</div>
                <button
                  onClick={handleVideoSelect}
                  className="block w-full px-6 py-3 bg-gray-600 text-white rounded-sm hover:bg-gray-700 font-['Roboto','Helvetica_Neue',Arial,sans-serif]"
                >
                  Subir Video
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
        <h4 className="font-medium text-yellow-800 mb-2">Consejos para la grabación:</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Asegúrate de tener buena iluminación</li>
          <li>• Mantén tu rostro centrado en la cámara</li>
          <li>• No uses lentes oscuros o sombreros</li>
          <li>• El video debe durar al menos 3 segundos</li>
        </ul>
      </div>

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
          onClick={handleNext}
          disabled={isSavingStep}
          className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-sm transition-colors duration-200 font-['Roboto','Helvetica_Neue',Arial,sans-serif] flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span>{isSavingStep ? t('common.loading') : 'Siguiente'}</span>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// 第6步：征信授权
const Step6CreditAuthorization: React.FC<StepProps> = ({ onNext, onBack, updateApplicationStep, isSavingStep }) => {
  const { t } = useTranslation();
  const [hasRead, setHasRead] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    // 使用更宽松的判断条件，允许1像素的误差
    const bottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 1;
    if (bottom) {
      setHasRead(true);
    }
  };

  const handleNext = async () => {
    if (!agreed) {
      alert(t('errors.required'));
      return;
    }
    const stepData = { agreed, hasRead };
    try {
      if (updateApplicationStep) {
        await updateApplicationStep(6, stepData);
      }
      await onNext();
    } catch (error) {
      console.error('Failed to save credit authorization step:', error);
      alert(t('errors.networkOffline'));
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center shadow-sm">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 3a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-['Source_Han_Sans_CN','PingFang_SC','Microsoft_YaHei',sans-serif]">
              Autorización de Crédito
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Lee y acepta los términos de autorización crediticia
            </p>
          </div>
        </div>
      </div>

      <div className="border border-slate-200 rounded-lg shadow-sm">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
          <h4 className="font-semibold text-slate-800">Acuerdo de Autorización Crediticia</h4>
        </div>
        <div
          className="p-4 h-64 overflow-y-auto text-sm leading-relaxed"
          onScroll={handleScroll}
        >
          <p className="mb-4">
            <strong>Propósito de la Autorización:</strong><br />
            Autorizo a DiliInfo Financial Services a consultar mi historial crediticio para evaluar mi solicitud de préstamo.
          </p>
          <p className="mb-4">
            <strong>Alcance de la Consulta:</strong><br />
            La consulta incluirá mi historial de pagos, deudas actuales, y calificación crediticia general.
          </p>
          <p className="mb-4">
            <strong>Protección de Privacidad:</strong><br />
            Toda la información obtenida será tratada de manera confidencial y utilizada únicamente para fines de evaluación crediticia.
          </p>
          <p className="mb-4">
            <strong>Período de Validez:</strong><br />
            Esta autorización es válida por 30 días a partir de la fecha de firma.
          </p>
          <p className="mb-4">
            <strong>Otros Términos:</strong><br />
            Puedes revocar esta autorización en cualquier momento contactando nuestro servicio al cliente.
          </p>
          <p className="mb-4">
            Al marcar la casilla a continuación, confirmas que has leído y entendido todos los términos de esta autorización.
          </p>
          <div className="text-center py-4">
            {hasRead ? (
              <div className="text-green-600 font-medium">✓ Has leído el acuerdo completo</div>
            ) : (
              <div className="space-y-2">
                <div className="text-gray-500">Desplázate hasta el final para leer el acuerdo completo</div>
                <button
                  onClick={() => setHasRead(true)}
                  className="text-slate-600 hover:text-slate-800 text-sm underline"
                >
                  He leído el acuerdo completo
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3 mt-6">
        <input
          type="checkbox"
          id="credit-agreement"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          disabled={!hasRead}
          className="w-4 h-4 text-slate-600 border-slate-300 rounded focus:ring-slate-500"
        />
        <label htmlFor="credit-agreement" className="text-sm text-slate-700">
          Acepto los términos de autorización crediticia
        </label>
      </div>

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
          onClick={handleNext}
          disabled={!agreed || isSavingStep}
          className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-sm transition-colors duration-200 font-['Roboto','Helvetica_Neue',Arial,sans-serif] flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{isSavingStep ? t('common.loading') : 'Aceptar y Continuar'}</span>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// 第7步：银行卡信息
const Step7BankCard: React.FC<StepProps> = ({ data, onUpdate, onNext, onBack, updateApplicationStep, isSavingStep }) => {
  const { t } = useTranslation();
  const [bankCardNumber, setBankCardNumber] = useState(data.bankCardNumber || '');

  const formatCardNumber = (value: string) => {
    // 移除所有非数字字符
    const numbers = value.replace(/\D/g, '');
    // 每4位添加一个空格
    return numbers.replace(/(\d{4})/g, '$1 ').trim();
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setBankCardNumber(formatted);
  };

  const handleNext = async () => {
    const cleanCardNumber = bankCardNumber.replace(/\s/g, '');
    if (!cleanCardNumber || cleanCardNumber.length < 16) {
      alert(t('errors.invalid'));
      return;
    }
    const stepData = { bankCardNumber: cleanCardNumber };
    onUpdate(stepData);
    try {
      if (updateApplicationStep) {
        await updateApplicationStep(7, stepData);
      }
      await onNext();
    } catch (error) {
      console.error('Failed to save bank card step:', error);
      alert(t('errors.networkOffline'));
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center shadow-sm">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-['Source_Han_Sans_CN','PingFang_SC','Microsoft_YaHei',sans-serif]">
              Información Bancaria
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Ingresa los datos de tu tarjeta bancaria
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Número de Tarjeta Bancaria
          </label>
          <input
            type="text"
            value={bankCardNumber}
            onChange={handleCardNumberChange}
            placeholder="1234 5678 9012 3456"
            className="w-full max-w-full px-2 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent text-sm sm:text-base lg:text-lg tracking-wider font-['Roboto','Helvetica_Neue',Arial,sans-serif] box-border"
            maxLength={23}
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">Información de Seguridad:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Tu información bancaria está protegida con encriptación SSL</li>
            <li>• Solo se utilizará para procesar tu préstamo</li>
            <li>• Nunca compartimos tus datos con terceros</li>
          </ul>
        </div>
      </div>

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
          onClick={handleNext}
          disabled={isSavingStep}
          className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-sm transition-colors duration-200 font-['Roboto','Helvetica_Neue',Arial,sans-serif] flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span>{isSavingStep ? t('common.loading') : 'Siguiente'}</span>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// 第8步：提交贷款申请
const Step8SubmitApplication: React.FC<StepProps> = ({ data, onNext, onBack, updateApplicationStep, isSavingStep }) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isSavingStep || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        alert(t('errors.networkOffline'));
        return;
      }

      // 模拟提交过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      const stepData = { submitted: true, submittedAt: Date.now() };
      if (updateApplicationStep) {
        await updateApplicationStep(8, stepData);
      }
      await onNext();
    } catch (error) {
      console.error('Submit failed:', error);
      alert(t('errors.networkOffline'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center shadow-sm">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-['Source_Han_Sans_CN','PingFang_SC','Microsoft_YaHei',sans-serif]">
              Enviar Solicitud
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Revisa y confirma tu información antes de enviar
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 rounded-lg p-6 mb-6">
        <h4 className="font-semibold mb-4 text-slate-800">Resumen de la Solicitud</h4>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Teléfono:</span>
            <span className="text-slate-900">{data.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Nombre Completo:</span>
            <span className="text-slate-900">{data.realName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Número de ID:</span>
            <span className="text-slate-900">{data.idNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Contacto 1:</span>
            <span className="text-slate-900">{data.contact1Name} ({data.contact1Phone})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Contacto 2:</span>
            <span className="text-slate-900">{data.contact2Name} ({data.contact2Phone})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Tarjeta Bancaria:</span>
            <span className="text-slate-900">****{data.bankCardNumber?.slice(-4)}</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-blue-800 mb-2">Información Importante:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Tu solicitud será procesada en 24-48 horas</li>
          <li>• Recibirás una notificación por SMS del resultado</li>
          <li>• Mantén tu teléfono disponible para verificación</li>
          <li>• Los fondos se depositarán en tu cuenta bancaria</li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center pt-8 mt-8 border-t border-slate-200 space-y-4 sm:space-y-0 sm:space-x-4">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="w-full sm:w-auto px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-sm hover:bg-slate-50 transition-colors duration-200 font-['Roboto','Helvetica_Neue',Arial,sans-serif] flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>Anterior</span>
        </button>
        
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || isSavingStep}
          className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-sm transition-colors duration-200 font-['Roboto','Helvetica_Neue',Arial,sans-serif] flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{(isSubmitting || isSavingStep) ? t('common.loading') : 'Enviar Solicitud'}</span>
          {!(isSubmitting || isSavingStep) && (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

// 第9步：审批中
const Step9Processing: React.FC<StepProps> = ({ onNext, updateApplicationStep }) => {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(10);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (isProcessingRef.current) {
            return prev;
          }

          isProcessingRef.current = true;
          const stepData = { processed: true, processedAt: Date.now() };
          (async () => {
            try {
              if (updateApplicationStep) {
                await updateApplicationStep(9, stepData);
              }
              await onNext();
              clearInterval(timer);
              setTimeLeft(0);
            } catch (error) {
              console.error('Failed to advance processing step:', error);
              alert(t('errors.networkOffline'));
              setTimeLeft(3);
              isProcessingRef.current = false;
            }
          })();
          return prev;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      isProcessingRef.current = false;
      clearInterval(timer);
    };
  }, [onNext, updateApplicationStep, t]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center shadow-sm">
            <svg className="w-6 h-6 text-white animate-spin" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-['Source_Han_Sans_CN','PingFang_SC','Microsoft_YaHei',sans-serif]">
              Procesando Solicitud
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Tu solicitud está siendo evaluada por nuestro sistema
            </p>
          </div>
        </div>
      </div>

      <div className="py-12">
        <div className="w-16 h-16 mx-auto mb-6 relative">
          <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-slate-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <div className="text-lg font-medium text-slate-600 mb-2">
          Procesando tu solicitud...
        </div>
        <div className="text-sm text-slate-500">
          Tiempo restante: {timeLeft} segundos
        </div>
      </div>

      <div className="bg-slate-50 rounded-lg p-6 text-left">
        <h4 className="font-semibold mb-4 text-slate-800">Proceso de Evaluación</h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            <span className="text-sm text-slate-700">Verificación de Identidad</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            <span className="text-sm text-slate-700">Autorización Crediticia</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-slate-500 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-white text-xs">?</span>
            </div>
            <span className="text-sm text-slate-700">Control de Riesgo</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">-</span>
            </div>
            <span className="text-sm text-gray-400">Aprobación Final</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// 第10步：审批通过
const Step10Approved: React.FC<StepProps> = ({ onNext, onBack, updateApplicationStep, isSavingStep }) => {
  const { t } = useTranslation();
  const approvedAmount = 100000; // 模拟审批金额

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <span className="text-4xl">🎉</span>
        </div>
        <h2 className="text-xl font-bold text-green-600 mb-2 font-['Source_Han_Sans_CN','PingFang_SC','Microsoft_YaHei',sans-serif]">
          ¡Felicitaciones!
        </h2>
        <p className="text-slate-600">Tu solicitud ha sido aprobada exitosamente</p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
        <h4 className="font-semibold text-green-800 mb-4">Resultado de la Aprobación</h4>
        <div className="space-y-2">
          <div className="text-3xl font-bold text-green-600">
            ${approvedAmount.toLocaleString()}
          </div>
          <div className="text-sm text-green-700">Monto aprobado para tu préstamo</div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">Condiciones del Préstamo:</h4>
          <div className="text-sm text-blue-700 space-y-1 text-left">
            <div>• Tasa de interés competitiva</div>
            <div>• Opciones de pago flexibles</div>
            <div>• Sin comisiones por adelantado</div>
            <div>• Pago anticipado sin penalización</div>
          </div>
        </div>

        <button
          disabled={isSavingStep}
          onClick={async () => {
            const stepData = { approved: true, approvedAmount, approvedAt: Date.now() };
            try {
              if (updateApplicationStep) {
                await updateApplicationStep(10, stepData);
              }
              await onNext();
            } catch (error) {
              console.error('Failed to proceed from approval step:', error);
              alert(t('errors.networkOffline'));
            }
          }}
          className="w-full px-6 py-4 bg-green-600 text-white rounded-sm hover:bg-green-700 font-medium text-lg font-['Roboto','Helvetica_Neue',Arial,sans-serif] transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSavingStep ? t('common.loading') : 'Retirar Ahora'}
        </button>
      </div>
    </div>
  );
};

// 第11步：提现设置
const Step11Withdrawal: React.FC<StepProps> = ({ data, onUpdate, onNext, onBack, updateApplicationStep, isSavingStep }) => {
  const { t } = useTranslation();
  const [withdrawalAmount, setWithdrawalAmount] = useState(data.withdrawalAmount || '');
  const [installmentPeriod, setInstallmentPeriod] = useState(data.installmentPeriod || 30);
  const maxAmount = 100000;

  const calculateTotalRepayment = (principal: number, days: number) => {
    const dailyRate = 0.03; // 3% 日利率
    const totalRepayment = principal * Math.pow(1 + dailyRate, days);
    return totalRepayment;
  };

  const calculateRepaymentDate = (days: number) => {
    const today = new Date();
    const repaymentDate = new Date(today.getTime());
    repaymentDate.setDate(today.getDate() + days);
    return repaymentDate.toLocaleDateString('es-MX', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleNext = async () => {
    const amount = parseFloat(withdrawalAmount.toString());
    if (!amount || amount <= 0 || amount > maxAmount) {
      alert(t('errors.invalid'));
      return;
    }
    const stepData = { withdrawalAmount: amount, installmentPeriod };
    onUpdate(stepData);
    try {
      if (updateApplicationStep) {
        await updateApplicationStep(11, stepData);
      }
      await onNext();
    } catch (error) {
      console.error('Failed to save withdrawal step:', error);
      alert(t('errors.networkOffline'));
    }
  };

  const totalRepayment = withdrawalAmount ? calculateTotalRepayment(parseFloat(withdrawalAmount.toString()), installmentPeriod) : 0;
  const repaymentDate = withdrawalAmount ? calculateRepaymentDate(installmentPeriod) : '';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center shadow-sm">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-['Source_Han_Sans_CN','PingFang_SC','Microsoft_YaHei',sans-serif]">
              Configuración de Retiro
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Configura el monto y período de pago
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Monto a Retirar
          </label>
          <input
            type="number"
            value={withdrawalAmount}
            onChange={(e) => setWithdrawalAmount(e.target.value)}
            placeholder="Ingresa el monto"
            max={maxAmount.toString()}
            min="1000"
            step="100"
            className="w-full max-w-full px-2 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent text-sm sm:text-base lg:text-lg font-['Roboto','Helvetica_Neue',Arial,sans-serif] box-border"
          />
          <div className="mt-2 text-sm text-slate-500">
            Rango: $1,000 - ${maxAmount.toLocaleString()}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Período de Pago
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[8, 15, 30].map((period) => (
              <button
                key={period}
                onClick={() => setInstallmentPeriod(period)}
                className={`p-3 border rounded-sm text-center transition-colors font-['Roboto','Helvetica_Neue',Arial,sans-serif] ${installmentPeriod === period
                  ? 'border-slate-500 bg-slate-50 text-slate-600'
                  : 'border-slate-300 hover:border-slate-400'
                  }`}
              >
                <div className="font-medium">{period} días</div>
                <div className="text-sm text-slate-500">{period} días</div>
              </button>
            ))}
          </div>
        </div>

        {withdrawalAmount && (
          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="font-semibold mb-3 text-slate-800">Plan de Pago</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Monto del Préstamo:</span>
                <span className="text-slate-900">${parseFloat(withdrawalAmount.toString()).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Período de Pago:</span>
                <span className="text-slate-900">{installmentPeriod} días</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Tasa de Interés:</span>
                <span className="text-slate-900">3% diario</span>
              </div>
              <hr className="my-2 border-slate-200" />
              <div className="flex justify-between font-medium">
                <span className="text-slate-700">Fecha de Pago:</span>
                <span className="text-slate-600">{repaymentDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Total a Pagar:</span>
                <span className="text-slate-900 font-semibold">${totalRepayment.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

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
          onClick={handleNext}
          disabled={isSavingStep}
          className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-sm transition-colors duration-200 font-['Roboto','Helvetica_Neue',Arial,sans-serif] flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span>{isSavingStep ? t('common.loading') : 'Siguiente'}</span>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// 第12步：提现完成
const Step12Complete: React.FC<StepProps> = ({ data, updateApplicationStep }) => {
  const { t } = useTranslation();

  // 在组件加载时记录完成状态
  useEffect(() => {
    const stepData = {
      completed: true,
      completedAt: Date.now(),
      withdrawalAmount: data.withdrawalAmount,
      installmentPeriod: data.installmentPeriod
    };
    if (updateApplicationStep) {
      updateApplicationStep(12, stepData).catch(error => {
        console.error('Failed to record completion step:', error);
        alert(t('errors.networkOffline'));
      });
    }
    
    // 追踪贷款申请完成事件
    if (data.withdrawalAmount) {
      trackLoanApplicationComplete(data.withdrawalAmount, 'personal');
    }
  }, [updateApplicationStep, data.withdrawalAmount, data.installmentPeriod, t]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <span className="text-4xl">✅</span>
        </div>
        <h2 className="text-xl font-bold text-green-600 mb-2 font-['Source_Han_Sans_CN','PingFang_SC','Microsoft_YaHei',sans-serif]">
          ¡Retiro Exitoso!
        </h2>
        <p className="text-slate-600">Tu solicitud ha sido procesada correctamente</p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
        <h4 className="font-semibold text-green-800 mb-4">Detalles del Retiro</h4>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Monto Retirado:</span>
            <span className="font-medium text-slate-900">${data.withdrawalAmount?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Tarjeta de Destino:</span>
            <span className="text-slate-900">****{data.bankCardNumber?.slice(-4)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Período de Pago:</span>
            <span className="text-slate-900">{data.installmentPeriod} días</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Tiempo de Llegada:</span>
            <span className="text-slate-900">2-5 minutos</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">Consejos Importantes:</h4>
          <ul className="text-sm text-blue-700 space-y-1 text-left">
            <li>• Verifica tu cuenta bancaria en los próximos minutos</li>
            <li>• Recibirás una notificación SMS de confirmación</li>
            <li>• Recuerda la fecha de vencimiento de tu pago</li>
            <li>• Contacta soporte si tienes alguna pregunta</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => window.location.href = '/user-center'}
            className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-sm hover:bg-slate-50 font-semibold font-['Roboto','Helvetica_Neue',Arial,sans-serif] transition-colors duration-200"
          >
            Ver Plan de Pago
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="flex-1 px-6 py-3 bg-slate-800 text-white rounded-sm hover:bg-slate-700 font-semibold font-['Roboto','Helvetica_Neue',Arial,sans-serif] transition-colors duration-200"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  );
};

// 主向导组件
// Main component for the loan application wizard
const LoanWizardEnhanced: React.FC = () => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [applicationData, setApplicationData] = useState<LoanApplication>({ step: 1 });
  const totalSteps = 12;
  const [isSavingStep, setIsSavingStep] = useState(false);

  // 初始化访客申请
  useEffect(() => {
    // 检查浏览器兼容性
    checkBrowserCompatibility();
    
    if (!applicationData.id) {
      createGuestApplication();
      // 追踪贷款申请开始事件
      trackLoanApplicationStart('personal');
    }
  }, []);

  const createGuestApplication = async () => {
    console.log('=== createGuestApplication called ===');
    const sessionId = safeStorage.getItem('sessionId') || 'guest-' + Date.now();
    safeStorage.setItem('sessionId', sessionId);
    console.log('🔑 Session ID:', sessionId);

    try {
      console.log('🚀 Creating guest application...');
      
      const result = await httpClient.postJson('/api/applications/guest', {}, {
        headers: {
          'X-Session-ID': sessionId
        }
      }) as {
        success: boolean;
        applicationId: string;
        sessionId: string;
        message?: string;
      };

      console.log('✅ Guest application result:', result);

      const newData = {
        id: result.applicationId,
        sessionId: result.sessionId,
        isGuest: true
      };
      console.log('📝 Setting application data:', newData);

      setApplicationData(prev => ({
        ...prev,
        ...newData
      }));
    } catch (error) {
      console.error('❌ Failed to create guest application:', error);
      // 如果创建失败，生成一个临时ID以便继续流程
      const fallbackData = {
        id: crypto.randomUUID(),
        sessionId: sessionId,
        isGuest: true
      };
      setApplicationData(prev => ({
        ...prev,
        ...fallbackData
      }));
    }
  };

  const updateApplicationStep = async (step: number, stepData: any) => {
    console.log('=== updateApplicationStep called ===');
    console.log('Step:', step);
    console.log('StepData:', stepData);
    console.log('ApplicationData.id:', applicationData.id);
    console.log('ApplicationData.phone:', applicationData.phone);
    console.log('ApplicationData.isGuest:', applicationData.isGuest);

    if (!applicationData.id) {
      console.error('No application ID found.');
      throw new Error('Application ID is missing, cannot persist step.');
    }

    try {
      const requestBody = {
        step,
        data: stepData,
        phone: applicationData.phone
      };
      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const result = await httpClient.putJson(
        `/api/applications/${applicationData.id}/step`,
        requestBody
      );
      console.log('Step update result:', result);
      return result;
    } catch (error) {
      console.error('Failed to update application step:', error);
      throw error;
    }
  };

  const updateData = (newData: Partial<LoanApplication>) => {
    console.log('=== updateData called ===');
    console.log('Previous applicationData:', applicationData);
    console.log('New data to merge:', newData);

    setApplicationData(prev => {
      const updated = { ...prev, ...newData };
      console.log('Updated applicationData:', updated);
      return updated;
    });
  };

  const nextStep = async () => {
    if (isSavingStep) {
      return;
    }

    if (currentStep >= totalSteps) {
      return;
    }

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      alert(t('errors.networkOffline'));
      return;
    }

    const targetStep = currentStep + 1;
    setIsSavingStep(true);
    try {
      await updateApplicationStep(targetStep, applicationData);
      setCurrentStep(targetStep);
    } catch (error) {
      console.error('Failed to persist step progress:', error);
      alert(t('errors.networkOffline'));
    } finally {
      setIsSavingStep(false);
    }
  };

  const prevStep = () => {
    if (isSavingStep) {
      return;
    }
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    const stepProps = {
      data: applicationData,
      onUpdate: updateData,
      onNext: nextStep,
      onBack: prevStep,
      updateApplicationStep,
      isSavingStep
    };

    switch (currentStep) {
      case 1:
        return <Step1UserRegistration {...stepProps} />;
      case 2:
        return <Step2Identity {...stepProps} />;
      case 3:
        return <Step3IdUpload {...stepProps} />;
      case 4:
        return <Step4Contacts {...stepProps} />;
      case 5:
        return <Step5LivenessDetection {...stepProps} />;
      case 6:
        return <Step6CreditAuthorization {...stepProps} />;
      case 7:
        return <Step7BankCard {...stepProps} />;
      case 8:
        return <Step8SubmitApplication {...stepProps} />;
      case 9:
        return <Step9Processing {...stepProps} />;
      case 10:
        return <Step10Approved {...stepProps} />;
      case 11:
        return <Step11Withdrawal {...stepProps} />;
      case 12:
        return <Step12Complete {...stepProps} />;
      default:
        return <div>未知步骤</div>;
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100 min-h-screen">
      {/* Hero Section - 完整的原版介绍内容 */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
            {/* 左侧文字内容 */}
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3 sm:mb-4 font-['Source_Han_Sans_CN','PingFang_SC','Microsoft_YaHei',sans-serif]">
                  Préstamos Personales Seguros
                </h1>
                <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
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

            {/* 右侧图片内容 */}
            <div className="space-y-6">
              {/* 主要图片 */}
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

              {/* 认证标识 */}
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

      {/* 桌面端Full-width，移动端适配 */}
      <div className="w-full">
        {/* 进度条 - 固定在顶部 */}
        <div className="bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-2 sm:px-4 py-2 sm:py-3 lg:py-4">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <h2 className="text-base sm:text-lg lg:text-xl font-bold text-slate-800">
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
                <div className="text-xs sm:text-sm font-semibold text-slate-800">
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
        <div className="w-full">
          {/* 桌面端：Full-width容器，移动端：适配容器 */}
          <div className="max-w-6xl mx-auto px-2 sm:px-4 py-3 sm:py-6 lg:py-8">
            <div className="flex flex-col lg:flex-row lg:space-x-8">
              {/* 左侧：步骤内容 (桌面端占2/3，移动端全宽) */}
              <div className="flex-1 lg:max-w-3xl min-w-0">
                <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
                  {renderStep()}
                </div>

                {/* 下方额外信息内容 - 包含所有原版的丰富内容 */}
                <div className="mt-6 sm:mt-8 space-y-6 sm:space-y-8">
                  {/* 简单流程介绍 */}
                  <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-4 sm:p-6">
                    <h3 className="font-bold text-slate-800 text-lg mb-6 font-['Source_Han_Sans_CN','PingFang_SC','Microsoft_YaHei',sans-serif]">
                      Proceso Simple en 3 Pasos
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
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

              {/* 右侧：信息面板 (桌面端显示，移动端隐藏) */}
              <div className="hidden lg:block lg:w-80 xl:w-96 lg:flex-shrink-0">
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

                  {/* 客户评价 */}
                  <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-6">
                    <h3 className="font-bold text-slate-800 text-lg mb-4">
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
                      <div className="border-l-4 border-slate-800 pl-4">
                        <p className="text-sm text-slate-600 italic mb-2">
                          "Las tasas son realmente competitivas y no hay sorpresas. Todo está muy claro desde el inicio."
                        </p>
                        <div className="flex items-center space-x-2">
                          <div className="flex text-yellow-400">
                            {'★'.repeat(5)}
                          </div>
                          <span className="text-xs text-slate-500">- Ana L.</span>
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
    </div>
  );
};

export default LoanWizardEnhanced; 
