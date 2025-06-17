import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

interface AnalyticsData {
  month: string;
  applications: number;
  enrolled: number;
  pending: number;
}

interface AnalyticsChartProps {
  data: AnalyticsData[];
  type: 'area' | 'bar' | 'line' | 'pie';
  title: string;
  height?: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ 
  data, 
  type, 
  title, 
  height = 300 
}) => {
  const renderChart = () => {
    switch (type) {
      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="month" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            <Area
              type="monotone"
              dataKey="applications"
              stackId="1"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="enrolled"
              stackId="1"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="pending"
              stackId="1"
              stroke="#f59e0b"
              fill="#f59e0b"
              fillOpacity={0.6}
            />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="month" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            <Bar dataKey="applications" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="enrolled" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        );

      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="month" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            <Line
              type="monotone"
              dataKey="applications"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="enrolled"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="pending"
              stroke="#f59e0b"
              strokeWidth={3}
              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        );

      case 'pie': {
        const pieData = [
          { name: 'Applications', value: data.reduce((sum, item) => sum + item.applications, 0) },
          { name: 'Enrolled', value: data.reduce((sum, item) => sum + item.enrolled, 0) },
          { name: 'Pending', value: data.reduce((sum, item) => sum + item.pending, 0) },
        ];
        
        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        );
      }

      default:
        return <div>Chart type not supported</div>;
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="card-body">
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsChart; 