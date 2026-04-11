import { notFound, redirect } from "next/navigation";

import { AdminFarmersActions } from "@/components/farmers/admin-farmers-actions";
import { AdminFarmersDataTable } from "@/components/farmers/admin-farmers-data-table";
import { getSession } from "@/lib/auth";
import { getFarmersForOrganization } from "@/lib/data/farmers";

export default async function AdminFarmersPage() {
  const session = await getSession();
  if (!session?.user?.organizationId) {
    redirect("/sign-in?callbackUrl=/admin/farmers");
  }

  const { farmers, organizationFound } = await getFarmersForOrganization(
    session.user.organizationId,
  );

  if (!organizationFound) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Farmers
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and manage farmer profiles: name, address, and mobile number.
          </p>
        </div>
        <AdminFarmersActions organizationId={session.user.organizationId} />
      </div>

      <AdminFarmersDataTable initialFarmers={farmers} />
    </div>
  );
}
