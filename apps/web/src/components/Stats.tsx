import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface StatItem {
  label: string;
  value: number;
  unit?: string;
}

const stats: StatItem[] = [
  { label: 'home.stats.creditIssued', value: 5000000, unit: '$' },
  { label: 'home.stats.approvalTime', value: 3, unit: 'min' },
  { label: 'home.stats.interestFree', value: 30, unit: 'days' },
];

function formatNumber(n: number) {
  return n.toLocaleString();
}

function StatCounter({ item, index, t }: { item: StatItem; index: number; t: any }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const step = Math.ceil(item.value / (duration / 16));
    const id = setInterval(() => {
      start += step;
      if (start >= item.value) {
        start = item.value;
        clearInterval(id);
      }
      setCount(start);
    }, 16);
    return () => clearInterval(id);
  }, [item.value]);

  return (
    <div className="text-center" style={{ animationDelay: `${index * 0.1}s` }}>
      <h3 className="text-4xl md:text-5xl font-extrabold text-primary-600 animate-fade-in-up">
        {item.unit === '$' && '$'}{formatNumber(count)}{item.unit && item.unit !== '$' && item.unit}
      </h3>
      <p className="mt-2 text-gray-600 animate-fade-in-up text-sm" style={{ animationDelay: `${index * 0.1 + 0.05}s` }}>
        {t(item.label)}
      </p>
    </div>
  );
}

export default function StatsSection() {
  const { t } = useTranslation();
  return (
    <section className="py-24 bg-white">
      <div className="container grid md:grid-cols-3 gap-12">
        {stats.map((s, i) => (
          <StatCounter item={s} index={i} key={i} t={t} />
        ))}
      </div>
    </section>
  );
} 