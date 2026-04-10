import { RoleStubPage } from "@/components/role-stub-page";

export default function ManagerSettingsPage() {
  return (
    <RoleStubPage
      title="Settings"
      description="Personal preferences and notification defaults for your manager account."
      body="Organization-wide configuration stays with admins; you control your own workspace here."
    />
  );
}
