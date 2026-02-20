import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  TooltipProps,
} from 'recharts';
import { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';

interface SaleData {
  date: string;
  amount: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [salesData, setSalesData] = useState<SaleData[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    // Example: replace with real API fetch
    setSalesData([
      { date: '2026-02-01', amount: 5000 },
      { date: '2026-02-02', amount: 7000 },
      { date: '2026-02-03', amount: 3000 },
    ]);
  }, []);

  // Tooltip formatter to handle undefined safely
  const tooltipFormatter = (value?: number) => {
    if (value === undefined) return ['KES 0', ''];
    return [`KES ${value.toLocaleString()}`, ''];
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Welcome back, {user?.email}. Here's what's happening today.
      </h1>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Calendar */}
        <div className="bg-secondary p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Select Date</h2>
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            components={{
              IconLeft: (props) => <ChevronLeft {...props} className="h-4 w-4" />,
              IconRight: (props) => <ChevronRight {...props} className="h-4 w-4" />,
            }}
          />
        </div>

        {/* Sales Chart */}
        <div className="bg-secondary p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Sales Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={tooltipFormatter} />
              <Legend />
              <Line type="monotone" dataKey="amount" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
