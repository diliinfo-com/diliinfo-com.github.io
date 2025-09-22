import { useTranslation } from 'react-i18next';
import LoanWizardEnhanced from '../components/LoanWizardEnhanced';

function Loan() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen">
      <LoanWizardEnhanced />
    </div>
  );
}

export default Loan;