import { getMe } from "@/service/getme";
import DashboardShell from "@/components/shered/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userRes = await getMe();
  const user = userRes?.data?.user || userRes?.data;

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
