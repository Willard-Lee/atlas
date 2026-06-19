import { notFound } from "next/navigation";
import AdminPanel from "./AdminPanel";

export default function AdminPage() {
    // Only accessible during local development — 404 in production
    if (process.env.NODE_ENV !== "development") notFound();
    return <AdminPanel />;
}
