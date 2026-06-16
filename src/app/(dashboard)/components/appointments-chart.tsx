"use client";

import dynamic from "next/dynamic";

const AppointmentsChartInner = dynamic(
  () =>
    import("./appointments-chart-inner").then((mod) => mod.AppointmentsChart),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full animate-pulse rounded-lg bg-muted/40"
        style={{ height: 260 }}
      />
    ),
  }
);

interface AppointmentsChartProps {
  data: { day: string; count: number }[];
}

export function AppointmentsChart({ data }: AppointmentsChartProps) {
  return <AppointmentsChartInner data={data} />;
}
