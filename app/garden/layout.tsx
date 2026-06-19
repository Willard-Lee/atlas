import GardenShell from "@/components/garden/GardenShell";
import GardenSidebar from "@/components/garden/GardenSidebar";

export default function GardenLayout({ children }: { children: React.ReactNode }) {
    return (
        <GardenShell sidebar={<GardenSidebar />}>
            {children}
        </GardenShell>
    );
}
