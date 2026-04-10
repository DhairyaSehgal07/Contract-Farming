import { RoleStubPage } from "@/components/role-stub-page";

export default function AdminReportsPage() {
  return (
    <RoleStubPage
      title="Reports"
      description="Per-farmer PDF reports covering profile, lands, and full lifecycle data."
      body="Export a complete report card for each farmer when reporting periods close."
    />
  );
}
