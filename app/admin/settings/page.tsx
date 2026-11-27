import type { Metadata } from "next";
import SettingsWorkspace from "@/components/admin/SettingsWorkspace";

export const metadata: Metadata = {
  title: "Settings | Aesthera Mère Admin",
  description: "Manage clinic details and booking policies.",
};

export default function SettingsPage() {
  return <SettingsWorkspace />;
}
