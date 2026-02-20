import * as React from "react";
import { ResponsiveContainer, Tooltip, TooltipProps, Legend, LegendProps, CartesianGrid, BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell } from "recharts";
import { cn } from "@/lib/utils";

type ChartConfigItem = {
  label?: React.ReactNode;
  icon?: React.ComponentType;
  color?: string;
};

export type ChartConfig = Record<string, ChartConfigItem>;

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

export function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) throw new Error("useChart must be used within ChartContainer");
  return context;
}

export const ChartContainer: React.FC<{ config: ChartConfig; children: React.ReactNode }> = ({ config, children }) => (
  <ChartContext.Provider value={{ config }}>
    <div className="flex aspect-video justify-center text-xs">{children}</div>
  </ChartContext.Provider>
);

export const ChartTooltipContent = <T extends any>({ payload, label }: TooltipProps<T, string>) => {
  const { config } = useChart();
  if (!payload || !payload.length) return null;
  return (
    <div className="p-2 bg-background rounded shadow">
      {payload.map((item) => (
        <div key={item.dataKey as string}>
          <span>{config[item.dataKey as string]?.label || item.dataKey}</span>
          <span>{item.value}</span>
        </div>
      ))}
    </div>
  );
};

export const ChartLegendContent: React.FC<LegendProps> = ({ payload }) => {
  const { config } = useChart();
  if (!payload) return null;
  return (
    <div className="flex gap-2">
      {payload.map((item) => (
        <div key={item.value as string}>
          <span style={{ background: config[item.value as string]?.color }}>{item.value}</span>
        </div>
      ))}
    </div>
  );
};
