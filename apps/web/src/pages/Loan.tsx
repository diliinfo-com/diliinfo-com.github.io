import { useTranslation } from 'react-i18next';
import LoanWizard from '../components/LoanWizard';

function Loan() {
  const { t } = useTranslation();
  return (
    <section className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">贷款申请</h1>
          <p className="text-xl text-gray-600">简单快捷的12步申请流程，最快3分钟完成</p>
        </div>
        
        <LoanWizard />
      </div>
    </section>
  );
}

export default Loan; 