import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, } from "recharts";
export const CHART_COLORS = [
    "hsl(25,95%,53%)",
    "hsl(142,71%,45%)",
    "hsl(217,91%,60%)",
    "hsl(38,92%,50%)",
    "hsl(0,72%,51%)",
];
export const WeeklyBarChart = ({ data }) => (_jsx(ResponsiveContainer, { width: "100%", height: 250, children: _jsxs(BarChart, { data: data, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "day" }), _jsx(YAxis, {}), _jsx(Tooltip, { formatter: (value) => (value ? `KES ${value.toLocaleString()}` : "KES 0") }), _jsx(Bar, { dataKey: "sales", fill: CHART_COLORS[0] }), _jsx(Bar, { dataKey: "profit", fill: CHART_COLORS[1] })] }) }));
export const PaymentPieChart = ({ data }) => (_jsx(ResponsiveContainer, { width: "100%", height: 250, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: data, dataKey: "value", cx: "50%", cy: "50%", innerRadius: 60, outerRadius: 90, children: data.map((_, idx) => (_jsx(Cell, { fill: CHART_COLORS[idx % CHART_COLORS.length] }, idx))) }), _jsx(Tooltip, { formatter: (value) => (value ? `KES ${value.toLocaleString()}` : "KES 0") })] }) }));
