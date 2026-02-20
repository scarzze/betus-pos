import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "@/lib/utils";

// Themes mapping
const THEMES = { light: "", dark: ".dark" } as const;

// Chart config
export type ChartConfig = {
  [k: string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & ({ color?: string; theme?: never } | { color?: never; theme: Record<keyof typeof THEMES, string> });
};

// Chart context
type ChartContextProps = { config: ChartConfig };
const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) throw new Error("useChart must be used within a <ChartContainer />");
  return context;
}

// Chart container
const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig;
    children: React.ReactNode;
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = "ChartContainer";

// Chart style
const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(([_, cfg]) => cfg.color || cfg.theme);
  if (!colorConfig.length) return null;

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, cfg]) => {
    const color = cfg.theme?.[theme as keyof typeof cfg.theme] || cfg.color;
    return color ? `  --color-${key}: ${color};` : "";
  })
  .join("\n")}
}`
          )
          .join("\n"),
      }}
    />
  );
};

// Chart tooltip
const ChartTooltip = RechartsPrimitive.Tooltip;

// Tooltip content
const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  RechartsPrimitive.TooltipProps & { hideLabel?: boolean; hideIndicator?: boolean; indicator?: "line" | "dot" | "dashed"; labelKey?: string; nameKey?: string }
>((props, ref) => {
  const { active, payload, className, hideLabel = false, hideIndicator = false, labelKey, nameKey, formatter } = props;
  const { config } = useChart();

  if (!active || !payload || payload.length === 0) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
    >
      {payload.map((item, idx) => {
        if (!item) return null;
        const key = `${labelKey || item.dataKey || item.name || "value"}`;
        const itemConfig = config[key];
        const indicatorColor = item.fill || item.color;

        return (
          <div key={idx} className="flex items-center gap-2">
            {!hideIndicator && <div style={{ backgroundColor: indicatorColor }} className="h-2 w-2 rounded-full" />}
            <span className="text-muted-foreground">{itemConfig?.label || item.name}</span>
            {item.value !== undefined && (
              <span className="font-mono font-medium tabular-nums text-foreground">{item.value}</span>
            )}
          </div>
        );
      })}
    </div>
  );
});
ChartTooltipContent.displayName = "ChartTooltipContent";

// Chart legend
const ChartLegend = RechartsPrimitive.Legend;

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & { hideIcon?: boolean; nameKey?: string }
>((props, ref) => {
  const { className, payload, verticalAlign = "bottom", hideIcon = false, nameKey } = props;
  const { config } = useChart();

  if (!payload || payload.length === 0) return null;

  return (
    <div
      ref={ref}
      className={cn("flex items-center justify-center gap-4", verticalAlign === "top" ? "pb-3" : "pt-3", className)}
    >
      {payload.map((item, idx) => {
        const key = `${nameKey || item.dataKey || item.value || "value"}`;
        const itemConfig = config[key];
        return (
          <div key={idx} className="flex items-center gap-1.5">
            {!hideIcon && itemConfig?.icon ? (
              <itemConfig.icon />
            ) : (
              <div className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: item.color || "#000" }} />
            )}
            {itemConfig?.label}
          </div>
        );
      })}
    </div>
  );
});
ChartLegendContent.displayName = "ChartLegendContent";

export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle };
