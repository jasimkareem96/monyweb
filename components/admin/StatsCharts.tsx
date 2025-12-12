"use client"

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface StatsChartsProps {
  ordersByStatus: { status: string; count: number }[]
  revenueByMonth: { month: string; revenue: number }[]
  ordersByType: { type: string; count: number }[]
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

export function StatsCharts({
  ordersByStatus,
  revenueByMonth,
  ordersByType,
}: StatsChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Orders by Status */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">الطلبات حسب الحالة</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={ordersByStatus}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="status" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#0088FE" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue by Month */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">الإيرادات الشهرية</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueByMonth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#00C49F" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Orders by Type */}
      <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
        <h3 className="text-lg font-semibold mb-4">الطلبات حسب نوع العرض</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={ordersByType}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {ordersByType.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

