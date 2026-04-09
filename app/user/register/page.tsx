import { getAllOrganizations } from "@/lib/data/organizations";
import UserRegisterForm from "./register-form";

export const dynamic = "force-dynamic";

export default async function UserRegisterPage() {
  let organizations: Awaited<ReturnType<typeof getAllOrganizations>> = [];
  try {
    organizations = await getAllOrganizations();
  } catch {
    organizations = [];
  }

  const options = organizations
    .filter((o) => o.isActive)
    .map((o) => ({
      id: String(o.id),
      name: o.name,
    }));

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <UserRegisterForm organizations={options} />
    </main>
  );
}
