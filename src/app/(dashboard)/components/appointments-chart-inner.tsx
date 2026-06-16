"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface AppointmentsChartProps {
  data: { day: string; count: number }[];
}

export function AppointmentsChart({ data }: AppointmentsChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.contentRect.width > 0) {
          setWidth(entry.contentRect.width);
        }
      }
    });
    
    observer.observe(containerRef.current);
    
    return () => observer.disconnect();
  }, []);

  if (width === 0) {
    return (
      <div ref={containerRef} className="w-full flex items-end justify-between gap-2 px-2" style={{ height: 260 }}>
        {/* Placeholder bars to avoid layout shift */}
        {[...Array(7)].map((_, i) => (
          <div key={i} className="w-full bg-slate-100 animate-pulse rounded-t-md" style={{ height: `${Math.max(20, Math.random() * 80)}%` }} />
        ))}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full" style={{ height: 260 }}>
      <BarChart
        width={width}
        height={260}
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
    </div>
  );
}
