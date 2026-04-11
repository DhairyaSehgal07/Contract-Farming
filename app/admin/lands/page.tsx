import { notFound, redirect } from "next/navigation";

import { AdminLandsActions } from "@/components/lands/admin-lands-actions";
import { AdminLandsDataTable } from "@/components/lands/admin-lands-data-table";
import { getSession } from "@/lib/auth";
import { getFarmersForOrganization } from "@/lib/data/farmers";
import { getLandsForOrganization } from "@/lib/data/lands";

export default async function AdminLandsPage() {
  const session = await getSession();
  if (!session?.user?.organizationId) {
    redirect("/sign-in?callbackUrl=/admin/lands");
  }

  const [{ farmers, organizationFound: orgOkFarmers }, { lands, organizationFound: orgOkLands }] =
    await Promise.all([
      getFarmersForOrganization(session.user.organizationId),
      getLandsForOrganization(session.user.organizationId),
    ]);

  if (!orgOkFarmers || !orgOkLands) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Lands
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Register parcels per farmer: name, area, unit, and optional GPS coordinates.
          </p>
        </div>
        <AdminLandsActions
          organizationId={session.user.organizationId}
          farmers={farmers}
        />
      </div>

      <AdminLandsDataTable initialLands={lands} farmers={farmers} />
    </div>
  );
}
