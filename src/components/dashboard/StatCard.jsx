import React from 'react';
import { cn } from '../../utils/cn';

export default function StatCard({ title, value, icon: Icon, trend, color }) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 bg-blue-500/10 text-blue-400",
    green: "bg-green-50 text-green-600 bg-green-500/10 text-green-400",
    indigo: "bg-indigo-50 text-indigo-600 bg-indigo-500/10 text-indigo-400",
    orange: "bg-orange-50 text-orange-600 bg-orange-500/10 text-orange-400",
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
            trend > 0 ? "bg-green-100 text-green-700 bg-green-500/20 text-green-400" : "bg-red-100 text-red-700 bg-red-500/20 text-red-400"
          )}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-slate-400 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-extrabold mt-1 text-white">{value}</h3>
    </div>
  );
}
