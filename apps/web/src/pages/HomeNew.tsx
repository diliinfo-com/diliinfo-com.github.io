import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/design-system.css';

function HomeNew() {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        {/* Hero Section - 专业金融风格 */}
        <section className="pt-24 pb-16 relative overflow-hidden">
          {/* 背景装饰 */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-20 left-10 w-72 h-72 bg-slate-800 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-slate-600 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
          </div>
          
          <div className="dili-container relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              {/* 信任指示器 */}
              <div className="inline-flex items-center space-x-2 bg-green-50 border border-green-200 rounded-full px-4 py-2 mb-8">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-green-700">Regulado por CNBV • Proceso 100% Seguro</span>
              </div>
              
              {/* 主标题 */}
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                Préstamos Personales
                <span className="block text-amber-600">Hasta $100,000 MXN</span>
              </h1>
              
              {/* 副标题 */}
              <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                Obtén tu préstamo con las mejores tasas del mercado. 
                Proceso 100% digital, aprobación en minutos y sin comisiones ocultas.
              </p>
              
              {/* 核心优势 */}
              <div className="flex flex-wrap justify-center gap-6 mb-10">
                <div className="flex items-center space-x-2 text-slate-700">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-semibold">Sin comisiones por apertura</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-700">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-semibold">Aprobación en 2 minutos</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-700">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-semibold">Tecnología bancaria</span>
                </div>
              </div>
              
              {/* CTA按钮 */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  to="/loan"
                  className="dili-button dili-button--primary dili-button--large px-8"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  Solicitar Préstamo
                </Link>
                <Link
                  to="/about"
                  className="dili-button dili-button--secondary px-8"
                >
                  Conocer más
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 信任徽章区域 */}
        <section className="py-12 bg-white border-y border-slate-200">
          <div className="dili-container">
            <div className="text-center mb-8">
              <h2 className="text-lg font-semibold text-slate-800 mb-2">Respaldados por las mejores instituciones</h2>
              <p className="text-sm text-slate-600">Regulados y supervisados por autoridades financieras</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60">
              {/* CNBV徽章 */}
              <div className="flex flex-col items-center space-y-2">
                <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-slate-600">CNBV</span>
              </div>
              
              {/* SSL徽章 */}
              <div className="flex flex-col items-center space-y-2">
                <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-slate-600">SSL 256-bit</span>
              </div>
              
              {/* ISO徽章 */}
              <div className="flex flex-col items-center space-y-2">
                <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-slate-600">ISO 27001</span>
              </div>
              
              {/* PCI徽章 */}
              <div className="flex flex-col items-center space-y-2">
                <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-slate-600">PCI DSS</span>
              </div>
            </div>
          </div>
        </section>

        {/* 统计数据区域 */}
        <section className="py-16 bg-slate-50">
          <div className="dili-container">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                Números que nos respaldan
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Miles de mexicanos ya confían en nosotros para sus necesidades financieras
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">50K+</div>
                <div className="text-sm text-slate-600">Préstamos otorgados</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">98%</div>
                <div className="text-sm text-slate-600">Satisfacción del cliente</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">2min</div>
                <div className="text-sm text-slate-600">Tiempo de aprobación</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">24/7</div>
                <div className="text-sm text-slate-600">Soporte disponible</div>
              </div>
            </div>
          </div>
        </section>

        {/* 流程步骤 */}
        <section className="py-16 bg-white">
          <div className="dili-container">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                Proceso simple y transparente
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Obtén tu préstamo en solo 3 pasos, sin complicaciones ni letra pequeña
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {/* 步骤1 */}
              <div className="dili-card dili-card--hover text-center">
                <div className="dili-card__body">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">1</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">Solicita</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Completa nuestra solicitud en línea en menos de 5 minutos. 
                    Solo necesitas tu INE y comprobante de ingresos.
                  </p>
                </div>
              </div>
              
              {/* 步骤2 */}
              <div className="dili-card dili-card--hover text-center">
                <div className="dili-card__body">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">2</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">Aprobación</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Nuestro sistema evalúa tu solicitud automáticamente. 
                    Recibirás una respuesta en menos de 2 minutos.
                  </p>
                </div>
              </div>
              
              {/* 步骤3 */}
              <div className="dili-card dili-card--hover text-center">
                <div className="dili-card__body">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">3</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">Recibe</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Una vez aprobado, el dinero se deposita directamente 
                    en tu cuenta bancaria en menos de 24 horas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 优势特性 */}
        <section className="py-16 bg-slate-50">
          <div className="dili-container">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                ¿Por qué elegir DiliInfo?
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Somos más que una fintech, somos tu socio financiero de confianza
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* 特性1 */}
              <div className="dili-card dili-card--hover">
                <div className="dili-card__body">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">100% Seguro</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Utilizamos encriptación de grado bancario y cumplimos con todos los 
                    estándares de seguridad internacionales para proteger tu información.
                  </p>
                </div>
              </div>
              
              {/* 特性2 */}
              <div className="dili-card dili-card--hover">
                <div className="dili-card__body">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">Tasas Competitivas</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Ofrecemos las mejores tasas del mercado mexicano, sin comisiones 
                    ocultas ni sorpresas en tu estado de cuenta.
                  </p>
                </div>
              </div>
              
              {/* 特性3 */}
              <div className="dili-card dili-card--hover">
                <div className="dili-card__body">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">Soporte 24/7</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Nuestro equipo de especialistas está disponible las 24 horas 
                    para resolver cualquier duda o problema que puedas tener.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 最终CTA */}
        <section className="py-16 bg-slate-800 text-white">
          <div className="dili-container text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              ¿Listo para obtener tu préstamo?
            </h2>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
              Únete a miles de mexicanos que ya confían en DiliInfo para sus necesidades financieras
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/loan"
                className="bg-white text-slate-800 hover:bg-slate-100 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span>Solicitar Ahora</span>
              </Link>
              
              <div className="flex items-center space-x-4 text-sm text-slate-300">
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Sin comisiones</span>
                </div>
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Aprobación rápida</span>
                </div>
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>100% seguro</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 页脚信任区域 */}
        <footer className="bg-slate-900 text-white py-8">
          <div className="dili-container">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
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
                © 2024 DiliInfo Financial Services, S.A. de C.V. Todos los derechos reservados.
              </div>
            </div>
            
            {/* 法律声明 */}
            <div className="mt-6 pt-6 border-t border-slate-800">
              <p className="text-xs text-slate-500 text-center leading-relaxed">
                DiliInfo Financial Services está regulado por la Comisión Nacional Bancaria y de Valores (CNBV). 
                Los préstamos están sujetos a aprobación crediticia. Tasas y términos pueden variar según el perfil del solicitante. 
                Consulta términos y condiciones completos en nuestro sitio web.
              </p>
            </div>
          </div>
        </footer>
      </div>
  );
}

export default HomeNew;