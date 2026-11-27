import type { Metadata } from "next";
import UsersWorkspace from "@/components/admin/UsersWorkspace";

export const metadata: Metadata = {
  title: "Users & Roles | Aesthera Mère Admin",
  description: "Manage clinic staff accounts and roles.",
};

export default function UsersPage() {
  return <UsersWorkspace />;
}
