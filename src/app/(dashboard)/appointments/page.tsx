import { Header } from "@/components/header";
import { CalendarDays } from "lucide-react";

export default function BarbersPage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Top Bar */}
            <Header icon={CalendarDays} span="Agendamentos" />
        </div>
    )
}