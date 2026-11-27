import type { Metadata } from "next";
import ReportsWorkspace from "@/components/admin/ReportsWorkspace";

export const metadata: Metadata = {
  title: "Reports | Aesthera Mère Admin",
  description: "Booking activity and attendance reports for Aesthera Mère.",
};

export default function ReportsPage() {
  return <ReportsWorkspace />;
}
