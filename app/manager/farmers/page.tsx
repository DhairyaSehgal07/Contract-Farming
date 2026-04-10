import { RoleStubPage } from "@/components/role-stub-page";

export default function ManagerFarmersPage() {
  return (
    <RoleStubPage
      title="Farmers"
      description="Monitor farmer profiles and assignments across your organization."
      body="View-only or guided edits depending on policy; full CRUD remains with admins where required."
    />
  );
}
