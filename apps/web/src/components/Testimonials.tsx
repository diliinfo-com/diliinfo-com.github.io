import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { HiStar, HiChevronLeft, HiChevronRight } from 'react-icons/hi';

const testimonials = [
  {
    nameKey: 'testimonials.customer1.name',
    textKey: 'testimonials.customer1.text',
    role: 'testimonials.customer1.role',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face'
  },
  {
    nameKey: 'testimonials.customer2.name',
    textKey: 'testimonials.customer2.text',
    role: 'testimonials.customer2.role',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face'
  },
  {
    nameKey: 'testimonials.customer3.name',
    textKey: 'testimonials.customer3.text',
    role: 'testimonials.customer3.role',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face'
  }
];

export default function Testimonials() {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextTestimonial = () => setCurrent((prev) => (prev + 1) % testimonials.length);
  const prevTestimonial = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="py-24 bg-gradient-to-b from-white to-trust-50">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-trust-800 mb-4 animate-slide-up">
            {t('testimonials.title')}
          </h2>
          <p className="text-trust-600 max-w-xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {t('testimonials.subtitle')}
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-trust-100 p-8 md:p-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center mb-6">
              {[...Array(5)].map((_, i) => (
                <HiStar key={i} className="w-5 h-5 text-yellow-400 fill-current" />
              ))}
            </div>
            
            <blockquote className="text-xl md:text-2xl text-trust-800 font-medium leading-relaxed mb-8">
              "{t(testimonials[current].textKey)}"
            </blockquote>
            
            <div className="flex items-center">
              <img 
                src={testimonials[current].avatar} 
                alt={t(testimonials[current].nameKey)}
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <div className="font-semibold text-trust-800">{t(testimonials[current].nameKey)}</div>
                <div className="text-trust-600 text-sm">{t(testimonials[current].role)}</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <button 
            onClick={prevTestimonial}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white border border-trust-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition"
          >
            <HiChevronLeft className="w-6 h-6 text-trust-600" />
          </button>
          
          <button 
            onClick={nextTestimonial}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white border border-trust-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition"
          >
            <HiChevronRight className="w-6 h-6 text-trust-600" />
          </button>

          {/* Dots */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`w-3 h-3 rounded-full transition ${
                  idx === current ? 'bg-primary-600' : 'bg-trust-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
} 