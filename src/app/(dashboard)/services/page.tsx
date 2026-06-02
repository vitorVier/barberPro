import { Header } from "@/app/(dashboard)/components/topbar";
import { Scissors } from "lucide-react";

export default function BarbersPage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Top Bar */}
            <Header icon={Scissors} span="Serviços" />
        </div>
    )
}