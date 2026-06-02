import { Header } from "@/app/(dashboard)/components/topbar";
import { Users } from "lucide-react";

export default function CustomersPage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Top Bar */}
            <Header icon={Users} span="Clientes" />
        </div>
    )
}