import { CalendarDays } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      {/* Icon container with subtle animation */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-amber/10 blur-2xl rounded-full scale-150 animate-pulse" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-amber/15 to-amber/5 text-amber border border-amber/20 shadow-lg shadow-amber/10">
          <CalendarDays className="h-9 w-9" />
        </div>
      </div>

      <h3 className="text-lg font-bold text-navy mb-1.5">
        Nenhum agendamento
      </h3>
      <p className="text-sm text-slate-400 text-center max-w-[280px] leading-relaxed">
        Não há agendamentos para este dia. Clique em{" "}
        <span className="font-semibold text-amber">"Novo Agendamento"</span>{" "}
        para adicionar.
      </p>
    </div>
  );
}
