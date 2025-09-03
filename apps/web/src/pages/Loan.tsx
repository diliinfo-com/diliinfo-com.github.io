import { useTranslation } from 'react-i18next';
import LoanWizard from '../components/LoanWizard';

function Loan() {
  const { t } = useTranslation();
  return (
    <section className="min-h-screen bg-gray-50 py-8 sm:py-16 px-2 sm:px-4">
      <div className="container mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">¡Préstamos con Interés Bajo!</h1>
          <p className="text-lg sm:text-xl text-gray-600 font-bold">Hasta 100,000 pesos de crédito</p>
          <p className="mt-2 sm:mt-4 text-base sm:text-lg text-blue-600">Ingresa tu número de teléfono para ver tu límite de crédito aprobado</p>
        </div>
        
        <div className="max-w-4xl mx-auto mb-8 sm:mb-12 px-2">
          <img 
            src="/Generated%20Image%20September%2002,%202025%20-%205_42PM.jpeg" 
            alt="Promoción de préstamos con interés bajo" 
            className="w-full rounded-xl shadow-lg"
          />
        </div>
        
        <LoanWizard />
      </div>
    </section>
  );
}

export default Loan; 