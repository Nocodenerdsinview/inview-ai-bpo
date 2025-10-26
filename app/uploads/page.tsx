import { AppLayout } from "@/components/shared/app-layout";
import { KPIManagementClient } from "./kpi-management-client";
import { db, schema } from "@/lib/db";
import { desc } from "drizzle-orm";

async function getUploads() {
  const uploads = await db
    .select()
    .from(schema.uploads)
    .orderBy(desc(schema.uploads.createdAt));

  return uploads;
}

export default async function UploadsPage() {
  const uploads = await getUploads();

  return (
    <AppLayout
      title="KPI Data Management"
      description="Upload files, manually enter data, or bulk import KPI records"
    >
      <KPIManagementClient uploadHistory={uploads} />
    </AppLayout>
  );
}


