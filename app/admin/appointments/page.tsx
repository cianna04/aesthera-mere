import type { Metadata } from "next";
import AppointmentsWorkspace from "@/components/admin/AppointmentsWorkspace";

export const metadata: Metadata = {
  title: "Appointments | Aesthera Mère Admin",
  description: "Manage appointments for Aesthera Mère.",
};

export default function AppointmentsPage() {
  return <AppointmentsWorkspace />;
}
