import { notFound, redirect } from "next/navigation";

import { LandLifecyclePanel } from "@/components/lands/land-lifecycle-panel";
import { getSession } from "@/lib/auth";
import { getLandByIdForOrganization } from "@/lib/data/lands";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminLandDetailPage({ params }: PageProps) {
  const session = await getSession();
  if (!session?.user?.organizationId) {
    redirect("/sign-in?callbackUrl=/admin/lands");
  }

  const { id } = await params;
  const { land, organizationFound } = await getLandByIdForOrganization(
    session.user.organizationId,
    id,
  );

  if (!organizationFound) {
    notFound();
  }

  if (!land) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
      <LandLifecyclePanel landId={land.id} land={land} />
    </div>
  );
}
