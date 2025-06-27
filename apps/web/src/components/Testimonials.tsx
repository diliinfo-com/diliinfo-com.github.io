import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

function Testimonials() {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);

  const testimonials = [
    {
      id: 1,
      quote: 'testimonials.testimonial1.quote',
      nameKey: 'testimonials.testimonial1.name',
      role: 'testimonials.testimonial1.role',
    },
    {
      id: 2,
      quote: 'testimonials.testimonial2.quote',
      nameKey: 'testimonials.testimonial2.name',
      role: 'testimonials.testimonial2.role',
    },
    {
      id: 3,
      quote: 'testimonials.testimonial3.quote',
      nameKey: 'testimonials.testimonial3.name',
      role: 'testimonials.testimonial3.role',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrent((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToTestimonial = (index: number) => {
    setCurrent(index);
  };

  return (
    <section className="py-24 bg-gradient-to-b from-white to-slate-50">
      <div className="container text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4 animate-slide-up">
          {t('testimonials.title')}
        </h2>
        <p className="text-slate-600 max-w-xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {t('testimonials.subtitle')}
        </p>

        <div className="mt-16 relative max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 md:p-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {/* Stars */}
            <div className="flex justify-center mb-6">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-6 h-6 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>

            <blockquote className="text-xl md:text-2xl text-slate-800 font-medium leading-relaxed mb-8">
              "{t(testimonials[current].quote)}"
            </blockquote>

            <div className="flex items-center justify-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {t(testimonials[current].nameKey).charAt(0)}
              </div>
              <div className="text-left">
                <div className="font-semibold text-slate-800">{t(testimonials[current].nameKey)}</div>
                <div className="text-slate-600 text-sm">{t(testimonials[current].role)}</div>
              </div>
            </div>

            {/* Navigation arrows */}
            <button
              onClick={prevTestimonial}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition"
            >
              <HiChevronLeft className="w-6 h-6 text-slate-600" />
            </button>
            <button
              onClick={nextTestimonial}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition"
            >
              <HiChevronRight className="w-6 h-6 text-slate-600" />
            </button>
          </div>

          {/* Dots */}
          <div className="flex justify-center space-x-2 mt-8">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToTestimonial(idx)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  idx === current ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Testimonials; 