import { ReactNode, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  trend?: number;
  iconBg?: string;
  iconColor?: string;
  valueColor?: string;
  alert?: boolean;
}

function AnimatedNumber({ value }: { value: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    const controls = animate(count, value, { duration: 1.2, ease: 'easeOut' });
    return controls.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
}

export default function StatCard({
  icon, label, value, sub, trend,
  iconBg = 'bg-gray-100', iconColor = 'text-gray-600',
  valueColor = 'text-gray-900', alert = false,
}: StatCardProps) {
  const isNumeric = typeof value === 'number';

  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border transition-shadow hover:shadow-md ${alert ? 'border-red-200 bg-red-50/30' : 'border-gray-100'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${iconBg}`}>
          <span className={iconColor}>{icon}</span>
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {trend >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
        {alert && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
      </div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-bold ${valueColor}`}>
        {isNumeric ? <AnimatedNumber value={value as number} /> : value}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}
