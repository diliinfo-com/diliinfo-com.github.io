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
  const [phone, setPhone] = useState(data.phone || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [mockCode, setMockCode] = useState('');
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

  const sendCode = () => {
    if (!phone) {
      alert('请输入手机号');
      return;
    }

    if (!password || password.length < 6) {
      alert('密码至少需要6位');
      return;
    }

    if (password !== confirmPassword) {
      alert('两次输入的密码不一致');
      return;
    }

    const fullPhone = countryCode + phone;
    const simulatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    setMockCode(simulatedCode);
    
    fetch('/api/auth/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: fullPhone, purpose: 'register' })
    })
    .then(response => {
      if (response.ok) {
        setCodeSent(true);
        setCountdown(60);
      } else {
        alert('发送验证码失败，请重试');
      }
    })
    .catch(() => {
      alert('网络错误，请重试');
    });
  };

  const verifyAndRegister = () => {
    if (!code || code.length !== 6) {
      alert('请输入6位验证码');
      return;
    }

    const fullPhone = countryCode + phone;

    // 在开发环境中，允许使用显示的模拟验证码
    if (code === mockCode) {
      if (updateApplicationStep) {
        updateApplicationStep(1, { phone: fullPhone, registered: true });
      }
      onUpdate({ phone: fullPhone });
      onNext();
      return;
    }

    fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        phone: fullPhone, 
        password,
        code, 
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
        alert(result.error || '注册失败，请重试');
      }
    })
    .catch(() => {
      alert('注册失败，请重试');
    });
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">用户注册</h3>
        <p className="text-gray-600">创建您的账户以开始申请</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            手机号码
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
              placeholder="请输入手机号码"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            密码
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入密码（至少6位）"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            minLength={6}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            确认密码
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="请再次输入密码"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {!codeSent ? (
          <button
            onClick={sendCode}
            disabled={!phone || !password || password !== confirmPassword || countdown > 0}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {countdown > 0 ? `重新发送 (${countdown}s)` : '发送验证码'}
          </button>
        ) : (
          <div className="space-y-4">
            {/* 模拟验证码显示区域 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <h4 className="text-sm font-medium text-yellow-800">测试用验证码</h4>
              </div>
              <p className="text-sm text-yellow-700 mb-2">
                为了方便测试，验证码已显示在下方：
              </p>
              <div className="bg-white border border-yellow-300 rounded px-3 py-2 font-mono text-lg font-bold text-center text-yellow-800">
                {mockCode}
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-yellow-600">
                  💡 生产环境中此提示将被移除，验证码将通过短信发送
                </p>
                <button
                  onClick={() => setCode(mockCode)}
                  className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-2 py-1 rounded border border-yellow-300 transition-colors"
                >
                  一键填入
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                验证码
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="请输入6位验证码"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={6}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={sendCode}
                disabled={countdown > 0}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {countdown > 0 ? `重新发送 (${countdown}s)` : '重新发送'}
              </button>
              <button
                onClick={verifyAndRegister}
                disabled={!code || code.length !== 6}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                完成注册
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 第2步：身份信息
const Step2Identity: React.FC<StepProps> = ({ data, onUpdate, onNext, onBack }) => {
  const [idNumber, setIdNumber] = useState(data.idNumber || '');
  const [realName, setRealName] = useState(data.realName || '');

  const handleNext = () => {
    if (!idNumber || !realName) {
      alert('请填写完整信息');
      return;
    }
    onUpdate({ idNumber, realName });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">身份信息</h3>
        <p className="text-gray-600">请填写您的真实身份信息</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            真实姓名
          </label>
          <input
            type="text"
            value={realName}
            onChange={(e) => setRealName(e.target.value)}
            placeholder="请输入真实姓名"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            身份证号码
          </label>
          <input
            type="text"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            placeholder="请输入身份证号码"
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
          上一步
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          下一步
        </button>
      </div>
    </div>
  );
};

// 第3步：身份证上传
const Step3IdUpload: React.FC<StepProps> = ({ onNext, onBack }) => {
  const [frontUploaded, setFrontUploaded] = useState(false);
  const [backUploaded, setBackUploaded] = useState(false);

  const handleFileUpload = (type: 'front' | 'back') => {
    // 这里应该实现真实的文件上传逻辑
    // 为了演示，我们直接设置为已上传
    if (type === 'front') {
      setFrontUploaded(true);
    } else {
      setBackUploaded(true);
    }
  };

  const handleNext = () => {
    if (!frontUploaded || !backUploaded) {
      alert('请上传身份证正反面照片');
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">上传身份证</h3>
        <p className="text-gray-600">请上传身份证正反面清晰照片</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <div className="space-y-4">
            <div className="text-4xl text-gray-400">📄</div>
            <div>
              <h4 className="font-medium">身份证正面</h4>
              <p className="text-sm text-gray-500">包含头像的一面</p>
            </div>
            {frontUploaded ? (
              <div className="text-green-600">✓ 已上传</div>
            ) : (
              <button
                onClick={() => handleFileUpload('front')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                点击上传
              </button>
            )}
          </div>
        </div>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <div className="space-y-4">
            <div className="text-4xl text-gray-400">📄</div>
            <div>
              <h4 className="font-medium">身份证反面</h4>
              <p className="text-sm text-gray-500">国徽面</p>
            </div>
            {backUploaded ? (
              <div className="text-green-600">✓ 已上传</div>
            ) : (
              <button
                onClick={() => handleFileUpload('back')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                点击上传
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
          上一步
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          下一步
        </button>
      </div>
    </div>
  );
};

// 第4步：联系人信息
const Step4Contacts: React.FC<StepProps> = ({ data, onUpdate, onNext, onBack }) => {
  const [contact1Name, setContact1Name] = useState(data.contact1Name || '');
  const [contact1Phone, setContact1Phone] = useState(data.contact1Phone || '');
  const [contact2Name, setContact2Name] = useState(data.contact2Name || '');
  const [contact2Phone, setContact2Phone] = useState(data.contact2Phone || '');

  const handleNext = () => {
    if (!contact1Name || !contact1Phone || !contact2Name || !contact2Phone) {
      alert('请填写完整的联系人信息');
      return;
    }
    onUpdate({ contact1Name, contact1Phone, contact2Name, contact2Phone });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">联系人信息</h3>
        <p className="text-gray-600">请填写两位联系人的信息</p>
      </div>
      
      <div className="space-y-6">
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-4">联系人1</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                姓名
              </label>
              <input
                type="text"
                value={contact1Name}
                onChange={(e) => setContact1Name(e.target.value)}
                placeholder="请输入联系人姓名"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                手机号码
              </label>
              <input
                type="tel"
                value={contact1Phone}
                onChange={(e) => setContact1Phone(e.target.value)}
                placeholder="请输入手机号码"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={11}
              />
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-4">联系人2</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                姓名
              </label>
              <input
                type="text"
                value={contact2Name}
                onChange={(e) => setContact2Name(e.target.value)}
                placeholder="请输入联系人姓名"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                手机号码
              </label>
              <input
                type="tel"
                value={contact2Phone}
                onChange={(e) => setContact2Phone(e.target.value)}
                placeholder="请输入手机号码"
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
          上一步
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          下一步
        </button>
      </div>
    </div>
  );
};

// 第5步：活体识别
const Step5LivenessDetection: React.FC<StepProps> = ({ onNext, onBack }) => {
  const [videoUploaded, setVideoUploaded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = () => {
    setIsRecording(true);
    // 模拟3秒录制
    setTimeout(() => {
      setIsRecording(false);
      setVideoUploaded(true);
    }, 3000);
  };

  const handleNext = () => {
    if (!videoUploaded) {
      alert('请完成活体识别');
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">活体识别</h3>
        <p className="text-gray-600">请录制一段3秒的自拍视频进行身份验证</p>
      </div>
      
      <div className="text-center">
        <div className="inline-block p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <div className="space-y-4">
            <div className="text-6xl">📹</div>
            <div>
              <h4 className="font-medium mb-2">活体检测</h4>
              <p className="text-sm text-gray-500 mb-4">
                请保持面部正对摄像头，录制3秒视频
              </p>
            </div>
            
            {videoUploaded ? (
              <div className="text-green-600">✓ 活体识别已完成</div>
            ) : isRecording ? (
              <div className="text-blue-600">录制中... 请保持面部正对摄像头</div>
            ) : (
              <button
                onClick={startRecording}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                开始录制
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-2">录制提示：</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• 请确保光线充足</li>
          <li>• 面部完整出现在画面中</li>
          <li>• 保持3秒钟面部正对摄像头</li>
          <li>• 不要戴帽子或遮挡面部</li>
        </ul>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          上一步
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          下一步
        </button>
      </div>
    </div>
  );
};

// 第6步：征信授权
const Step6CreditAuthorization: React.FC<StepProps> = ({ onNext, onBack }) => {
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
      alert('请阅读并同意征信授权协议');
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">征信授权查询</h3>
        <p className="text-gray-600">请仔细阅读征信授权协议并同意</p>
      </div>
      
      <div className="border rounded-lg">
        <div className="bg-gray-50 px-4 py-3 border-b">
          <h4 className="font-semibold">个人征信查询授权协议</h4>
        </div>
        <div 
          className="p-4 h-64 overflow-y-auto text-sm leading-relaxed"
          onScroll={handleScroll}
        >
          <p className="mb-4">
            <strong>第一条 授权目的</strong><br/>
            为了评估您的信用状况，我们需要查询您的个人征信报告。本协议旨在获得您的明确授权。
          </p>
          <p className="mb-4">
            <strong>第二条 查询范围</strong><br/>
            授权查询内容包括但不限于：信贷记录、公共记录、查询记录等征信信息。
          </p>
          <p className="mb-4">
            <strong>第三条 信息保护</strong><br/>
            我们承诺严格保护您的个人信息，仅用于贷款审核目的，不会泄露给第三方。
          </p>
          <p className="mb-4">
            <strong>第四条 授权期限</strong><br/>
            本次授权有效期为30天，仅限本次贷款申请使用。
          </p>
          <p className="mb-4">
            <strong>第五条 其他条款</strong><br/>
            您有权了解征信查询结果，如有异议可向相关征信机构申请复议。
          </p>
          <p className="mb-4">
            本协议的解释权归本公司所有。如您同意以上条款，请点击"同意"按钮。
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
          我已阅读并同意《个人征信查询授权协议》
        </label>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          上一步
        </button>
        <button
          onClick={handleNext}
          disabled={!agreed}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          同意并继续
        </button>
      </div>
    </div>
  );
};

// 第7步：银行卡信息
const Step7BankCard: React.FC<StepProps> = ({ data, onUpdate, onNext, onBack }) => {
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
      alert('请输入有效的银行卡号');
      return;
    }
    onUpdate({ bankCardNumber: cleanCardNumber });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">银行卡信息</h3>
        <p className="text-gray-600">请输入您的银行卡号码</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            银行卡号码
          </label>
          <input
            type="text"
            value={bankCardNumber}
            onChange={handleCardNumberChange}
            placeholder="请输入银行卡号码"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg tracking-wider"
            maxLength={23} // 16位数字 + 3个空格
          />
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">安全提示：</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 请输入您本人名下的银行卡</li>
            <li>• 确保银行卡状态正常，可正常使用</li>
            <li>• 我们承诺保护您的资金安全</li>
          </ul>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          上一步
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          下一步
        </button>
      </div>
    </div>
  );
};

// 第8步：提交贷款申请
const Step8SubmitApplication: React.FC<StepProps> = ({ data, onNext, onBack }) => {
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
        <h3 className="text-2xl font-bold mb-2">提交贷款申请</h3>
        <p className="text-gray-600">请确认您的申请信息并提交</p>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-semibold mb-4">申请信息摘要</h4>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">手机号：</span>
            <span>{data.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">真实姓名：</span>
            <span>{data.realName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">身份证号：</span>
            <span>{data.idNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">联系人1：</span>
            <span>{data.contact1Name} ({data.contact1Phone})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">联系人2：</span>
            <span>{data.contact2Name} ({data.contact2Phone})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">银行卡号：</span>
            <span>****{data.bankCardNumber?.slice(-4)}</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">重要提示：</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 提交后将进入审核流程</li>
          <li>• 审核过程大约需要1-3分钟</li>
          <li>• 请确保所填信息真实有效</li>
          <li>• 虚假信息将影响审核结果</li>
        </ul>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          disabled={isSubmitting}
        >
          上一步
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? '提交中...' : '提交申请'}
        </button>
      </div>
    </div>
  );
};

// 第9步：审批中
const Step9Processing: React.FC<StepProps> = ({ onNext }) => {
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
        <h3 className="text-2xl font-bold mb-2">贷款审批中</h3>
        <p className="text-gray-600">我们正在审核您的申请，请稍候...</p>
      </div>
      
      <div className="py-12">
        <div className="w-16 h-16 mx-auto mb-6 relative">
          <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <div className="text-lg font-medium text-blue-600 mb-2">
          审核进行中
        </div>
        <div className="text-sm text-gray-500">
          预计剩余时间：{timeLeft} 秒
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-semibold mb-4">审核流程</h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            <span className="text-sm">身份信息验证</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            <span className="text-sm">征信查询</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-white text-xs">?</span>
            </div>
            <span className="text-sm">风控评估</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">-</span>
            </div>
            <span className="text-sm text-gray-400">最终审批</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// 第10步：审批通过
const Step10Approved: React.FC<StepProps> = ({ onNext, onBack }) => {
  const approvedAmount = 50000; // 模拟审批金额

  return (
    <div className="space-y-6 text-center">
      <div>
        <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <span className="text-4xl">🎉</span>
        </div>
        <h3 className="text-2xl font-bold text-green-600 mb-2">恭喜！审批通过</h3>
        <p className="text-gray-600">您的贷款申请已获得批准</p>
      </div>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h4 className="font-semibold text-green-800 mb-4">审批结果</h4>
        <div className="space-y-2">
          <div className="text-3xl font-bold text-green-600">
            ¥{approvedAmount.toLocaleString()}
          </div>
          <div className="text-sm text-green-700">获批金额</div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">借款条件：</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <div>• 利率：年化15.6%</div>
            <div>• 可选期数：3、6、12期</div>
            <div>• 无前置费用</div>
            <div>• 提前还款不收违约金</div>
          </div>
        </div>
        
        <button
          onClick={onNext}
          className="w-full px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-lg"
        >
          立即提现
        </button>
      </div>
    </div>
  );
};

// 第11步：提现设置
const Step11Withdrawal: React.FC<StepProps> = ({ data, onUpdate, onNext, onBack }) => {
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
       alert(`请输入有效的提现金额（最高 ¥${maxAmount.toLocaleString()}）`);
       return;
     }
     onUpdate({ withdrawalAmount: amount, installmentPeriod });
     onNext();
   };

     const monthlyPayment = withdrawalAmount ? calculateMonthlyPayment(parseFloat(withdrawalAmount.toString()), installmentPeriod) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">设置提现金额</h3>
        <p className="text-gray-600">请选择提现金额和分期期数</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            提现金额（¥）
          </label>
                     <input
             type="number"
             value={withdrawalAmount}
             onChange={(e) => setWithdrawalAmount(e.target.value)}
             placeholder="请输入提现金额"
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
            分期期数
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
                <div className="font-medium">{period}期</div>
                <div className="text-sm text-gray-500">{period}个月</div>
              </button>
            ))}
          </div>
        </div>

        {withdrawalAmount && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold mb-3">还款计划</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">借款金额：</span>
                <span>¥{parseFloat(withdrawalAmount.toString()).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">分期期数：</span>
                <span>{installmentPeriod}期</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">年利率：</span>
                <span>15.6%</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-medium">
                <span>每期还款：</span>
                <span className="text-blue-600">¥{monthlyPayment.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">总还款：</span>
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
          上一步
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          确认提现
        </button>
      </div>
    </div>
  );
};

// 第12步：提现完成
const Step12Complete: React.FC<StepProps> = ({ data }) => {
  return (
    <div className="space-y-6 text-center">
      <div>
        <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <span className="text-4xl">✅</span>
        </div>
        <h3 className="text-2xl font-bold text-green-600 mb-2">提现成功！</h3>
        <p className="text-gray-600">资金将在2小时内到达您的银行账户</p>
      </div>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h4 className="font-semibold text-green-800 mb-4">提现详情</h4>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">提现金额：</span>
            <span className="font-medium">¥{data.withdrawalAmount?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">到账银行卡：</span>
            <span>****{data.bankCardNumber?.slice(-4)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">分期期数：</span>
            <span>{data.installmentPeriod}期</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">预计到账时间：</span>
            <span>2小时内</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">温馨提示：</h4>
          <ul className="text-sm text-blue-700 space-y-1 text-left">
            <li>• 请保持手机畅通，我们会发送到账短信</li>
            <li>• 首期还款日为放款后30天</li>
            <li>• 可在用户中心查看还款计划</li>
            <li>• 支持提前还款，无违约金</li>
          </ul>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => window.location.href = '/user-center'}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            查看还款计划
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            返回首页
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
          <span className="text-sm font-medium text-blue-600">步骤 {currentStep} / {totalSteps}</span>
          <span className="text-sm text-gray-500">{Math.round((currentStep / totalSteps) * 100)}% 完成</span>
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