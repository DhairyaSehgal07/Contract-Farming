import { RoleStubPage } from "@/components/role-stub-page";

export default function AdminTeamPage() {
  return (
    <RoleStubPage
      title="Team"
      description="Organization roles: Admin (full control), Manager (oversight), Staff (field execution)."
      body="Invite users and assign roles so monitoring, uploads, and approvals stay clear."
    />
  );
}
