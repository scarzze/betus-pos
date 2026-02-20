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
  TooltipProps,
  LineChart,
  Line,
} from "recharts";
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

export const CHART_COLORS = [
  "hsl(25, 95%, 53%)",
  "hsl(142, 71%, 45%)",
  "hsl(217, 91%, 60%)",
  "hsl(38, 92%, 50%)",
  "hsl(0, 72%, 51%)",
];

export interface BarChartData {
  day: string;
  sales: number;
  profit: number;
}

export interface PieChartData {
  name: string;
  value: number;
}

interface BarChartProps {
  data: BarChartData[];
}

interface PieChartProps {
  data: PieChartData[];
}

const currencyFormatter = (value?: number) => (value ? `KES ${value.toLocaleString()}` : "KES 0");

export const WeeklyBarChart: React.FC<BarChartProps> = ({ data }) => (
  <ResponsiveContainer width="100%" height={250}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,12%,18%)" />
      <XAxis dataKey="day" stroke="hsl(220,10%,55%)" fontSize={12} />
      <YAxis stroke="hsl(220,10%,55%)" fontSize={12} />
      <Tooltip
        formatter={(value?: number, name?: string, props?: any) => [currencyFormatter(value), name || ""]}
      />
      <Bar dataKey="sales" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} name="Sales" />
      <Bar dataKey="profit" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} name="Profit" />
    </BarChart>
  </ResponsiveContainer>
);

export const PaymentPieChart: React.FC<PieChartProps> = ({ data }) => (
  <ResponsiveContainer width="100%" height={250}>
    <PieChart>
      <Pie data={data} dataKey="value" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5}>
        {data.map((_, idx) => (
          <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
        ))}
      </Pie>
      <Tooltip formatter={(value?: number) => currencyFormatter(value)} />
    </PieChart>
  </ResponsiveContainer>
);
