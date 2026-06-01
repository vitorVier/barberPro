import { Header } from "@/components/header";
import { Sparkles } from "lucide-react";

export default function BarbersPage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Top Bar */}
            <Header icon={Sparkles} span="Serviços" />
        </div>
    )
}