// src/components/ui/chart.tsx
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Premium Design System Colors
export const CHART_COLORS = [
  "#6366f1", // Primary (Indigo)
  "#10b981", // Success (Emerald)
  "#f97316", // Accent (Orange)
  "#ec4899", // Secondary (Pink)
  "#ef4444", // Danger (Red)
];

interface WeeklyData {
  day: string;
  sales: number;
  profit: number;
}

interface PaymentData {
  name: string;
  value: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bt-glass-card" style={{ padding: '12px', border: '1px solid var(--border-light)', backdropFilter: 'blur(20px)' }}>
        <p className="bt-label" style={{ marginBottom: '4px' }}>{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color, fontSize: '14px', fontWeight: 700 }}>
            {entry.name}: KES {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const WeeklyBarChart: React.FC<{ data: WeeklyData[] }> = ({ data }) => (
  <ResponsiveContainer width="100%" height={280}>
    <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
      <XAxis 
        dataKey="day" 
        axisLine={false} 
        tickLine={false} 
        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} 
        dy={10}
      />
      <YAxis 
        axisLine={false} 
        tickLine={false} 
        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
        tickFormatter={(v) => v >= 1000 ? `${v/1000}k` : v}
      />
      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
      <Bar dataKey="sales" name="Sales" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} barSize={24} />
    </BarChart>
  </ResponsiveContainer>
);

export const PaymentPieChart: React.FC<{ data: PaymentData[] }> = ({ data }) => (
  <ResponsiveContainer width="100%" height={280}>
    <PieChart>
      <Pie 
        data={data} 
        dataKey="value" 
        cx="50%" 
        cy="50%" 
        innerRadius={70} 
        outerRadius={95} 
        paddingAngle={5}
        stroke="none"
      >
        {data.map((_, idx) => (
          <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} style={{ outline: 'none' }} />
        ))}
      </Pie>
      <Tooltip content={<CustomTooltip />} />
    </PieChart>
  </ResponsiveContainer>
);
