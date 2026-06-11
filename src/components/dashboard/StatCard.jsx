import React from 'react';
import { cn } from '../../utils/cn';

export default function StatCard({ title, value, icon: Icon, trend, color }) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    green: "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
    indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
    orange: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
  };

  return (
    <div className="glass-card hover-scale">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-3 rounded-xl", colorClasses[color] || colorClasses.indigo)}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className={cn(
            "text-xs font-semibold px-2 py-1 rounded-full",
            trend > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          )}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold mt-1 text-slate-800 dark:text-slate-100">{value}</h3>
    </div>
  );
}
