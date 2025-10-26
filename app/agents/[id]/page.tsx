import { AppLayout } from "@/components/shared/app-layout";
import { AgentProfileClient } from "./agent-profile-client";

export default async function AgentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AppLayout title="Agent Profile" description="View detailed agent performance and history">
      <AgentProfileClient />
    </AppLayout>
  );
}
