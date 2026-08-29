import React from 'react';
import { Mail, CheckCircle2, Clock, XCircle } from 'lucide-react';

export default function MetricsBar({ counts }) {
  const cards = [
    {
      title: 'Total Emails',
      value: counts.total || 0,
      icon: Mail,
      color: 'text-[#00B04F]',
      bgColor: 'bg-[#E6F7ED]',
    },
    {
      title: 'Sent',
      value: counts.sent || 0,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Pending',
      value: counts.pending || 0,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      title: 'Failed',
      value: counts.failed || 0,
      icon: XCircle,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div 
          key={index}
          className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-between group"
        >
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              {card.title}
            </p>
            <p className="text-2xl font-black text-gray-900">
              {card.value.toLocaleString()}
            </p>
          </div>
          <div className={`p-3 rounded-xl ${card.bgColor} group-hover:scale-105 transition-transform`}>
            <card.icon className={`h-6 w-6 ${card.color}`} />
          </div>
        </div>
      ))}
    </div>
  );
}
