export const STATUS_CONFIG = {
  SCHEDULED: {
    label: "Agendado",
    color: "bg-blue-500",
    colorLight: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    ringColor: "ring-blue-500/20",
    bgAccent: "bg-blue-500/8",
  },
  CONFIRMED: {
    label: "Confirmado",
    color: "bg-emerald-500",
    colorLight: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200",
    ringColor: "ring-emerald-500/20",
    bgAccent: "bg-emerald-500/8",
  },
  COMPLETED: {
    label: "Concluído",
    color: "bg-teal-400",
    colorLight: "bg-slate-50",
    textColor: "text-teal-700",
    borderColor: "border-teal-400",
    ringColor: "ring-slate-400/20",
    bgAccent: "bg-slate-400/8",
  },
  CANCELLED: {
    label: "Cancelado",
    color: "bg-red-500",
    colorLight: "bg-red-50",
    textColor: "text-red-600",
    borderColor: "border-red-200",
    ringColor: "ring-red-500/20",
    bgAccent: "bg-red-500/8",
  },
  NO_SHOW: {
    label: "Não Compareceu",
    color: "bg-orange-500",
    colorLight: "bg-orange-50",
    textColor: "text-orange-600",
    borderColor: "border-orange-200",
    ringColor: "ring-orange-500/20",
    bgAccent: "bg-orange-500/8",
  },
} as const;

export type AppointmentStatusKey = keyof typeof STATUS_CONFIG;

export function StatusLegend() {
  return (
    <div className="flex items-center gap-5 flex-wrap">
      {Object.entries(STATUS_CONFIG).map(([key, config]) => (
        <div key={key} className="flex items-center gap-1.5">
          <span
            className={`inline-block h-2.5 w-2.5 rounded-full ${config.color} ring-2 ${config.ringColor}`}
          />
          <span className="text-xs font-medium text-slate-500">
            {config.label}
          </span>
        </div>
      ))}
    </div>
  );
}
