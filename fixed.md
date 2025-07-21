// 第11步：提现设置
const Step11Withdrawal: React.FC<StepProps> = ({ data, onUpdate, onNext, onBack, updateApplicationStep }) => {
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
    const stepData = { withdrawalAmount: amount, installmentPeriod };
    onUpdate(stepData);
    if (updateApplicationStep) {
      updateApplicationStep(11, stepData);
    }
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
            {t('loanWizard.step11.withdrawalRangeLabel', { maxAmount: maxAmount.toLocaleString() })}
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
                <span>${parseFloat(withdrawalAmount.toString()).toLocaleString()}</span>
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
                <span className="text-blue-600">${monthlyPayment.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('loanWizard.step11.totalRepaymentLabel')}:</span>
                <span>${(monthlyPayment * installmentPeriod).toFixed(2)}</span>
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
      
      const response = await fetch(getApiUrl('/api/applications/guest'), {
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
      console.log('Updating application step:', step, 'for application:', applicationData.id);
      const response = await fetch(getApiUrl(`/api/applications/${applicationData.id}/step`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          step, 
          data: stepData,
          phone: applicationData.phone 
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Step update result:', result);
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