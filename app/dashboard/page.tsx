import { AppLayout } from "@/components/shared/app-layout";
import { DashboardClient } from "./dashboard-client";

export default function DashboardPage() {
  return (
    <AppLayout
      title="Team Dashboard"
      description="Real-time team performance and agent insights"
    >
      <DashboardClient />
    </AppLayout>
  );
}
