"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AppointmentsChartProps {
  data: { day: string; count: number }[];
}

export function AppointmentsChart({ data }: AppointmentsChartProps) {
  return (
    <div className="h-65 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#6B7280" }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#6B7280" }}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(245, 158, 11, 0.08)" }}
            contentStyle={{
              backgroundColor: "#1B2138",
              border: "none",
              borderRadius: "8px",
              padding: "8px 12px",
              color: "#fff",
              fontSize: "13px",
            }}
            formatter={(value) => [
              `${value} agendamento${Number(value) !== 1 ? "s" : ""}`,
              "",
            ]}
            labelStyle={{ color: "#94A3B8", fontSize: "11px", marginBottom: 2 }}
          />
          <Bar
            dataKey="count"
            fill="#F59E0B"
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
