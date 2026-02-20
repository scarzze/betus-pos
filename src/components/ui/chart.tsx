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

export const CHART_COLORS = [
  "hsl(25,95%,53%)",
  "hsl(142,71%,45%)",
  "hsl(217,91%,60%)",
  "hsl(38,92%,50%)",
  "hsl(0,72%,51%)",
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

export const WeeklyBarChart: React.FC<{ data: WeeklyData[] }> = ({ data }) => (
  <ResponsiveContainer width="100%" height={250}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="day" />
      <YAxis />
      <Tooltip formatter={(value?: number) => (value ? `KES ${value.toLocaleString()}` : "KES 0")} />
      <Bar dataKey="sales" fill={CHART_COLORS[0]} />
      <Bar dataKey="profit" fill={CHART_COLORS[1]} />
    </BarChart>
  </ResponsiveContainer>
);

export const PaymentPieChart: React.FC<{ data: PaymentData[] }> = ({ data }) => (
  <ResponsiveContainer width="100%" height={250}>
    <PieChart>
      <Pie data={data} dataKey="value" cx="50%" cy="50%" innerRadius={60} outerRadius={90}>
        {data.map((_, idx) => (
          <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
        ))}
      </Pie>
      <Tooltip formatter={(value?: number) => (value ? `KES ${value.toLocaleString()}` : "KES 0")} />
    </PieChart>
  </ResponsiveContainer>
);
