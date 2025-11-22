import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { RouteOption } from '../types';

interface ImpactChartProps {
  routes: RouteOption[];
}

export const ImpactChart: React.FC<ImpactChartProps> = ({ routes }) => {
  if (routes.length === 0) return null;

  const data = routes.map(r => ({
    name: r.tags[0] || r.id,
    co2: r.co2Emitted,
    saved: r.co2Saved,
    cost: r.totalCost
  }));

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Carbon Footprint Comparison</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
            <Tooltip 
              cursor={{fill: 'transparent'}}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Bar dataKey="co2" name="CO2 Emitted (kg)" radius={[0, 4, 4, 0]} barSize={20}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.saved > 1 ? '#10b981' : '#94a3b8'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-gray-400 text-center mt-2">Lower is better. Green bars indicate significant savings vs. car.</p>
    </div>
  );
};
