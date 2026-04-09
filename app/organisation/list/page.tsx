import Link from "next/link";
import { AlertCircleIcon, InboxIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAllOrganizations } from "@/lib/data/organizations";
import { OrganisationListTable } from "./organisation-list-table";

/** Always fetch fresh data; this list is driven by the same query as GET /api/organisation. */
export const dynamic = "force-dynamic";

export default async function OrganisationListPage() {
  let organizations: Awaited<ReturnType<typeof getAllOrganizations>>;
  let loadError: string | null = null;

  try {
    organizations = await getAllOrganizations();
  } catch {
    organizations = [];
    loadError = "Could not load organizations. Try again later.";
  }

  const listRows =
    loadError === null
      ? organizations.map((organization) => ({
          id: String(organization.id),
          name: organization.name,
          contactDetails: organization.contactDetails,
          isActive: organization.isActive,
          createdAt: organization.createdAt?.toISOString() ?? null,
        }))
      : [];

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Organisations
            </h1>
            <p className="text-sm text-muted-foreground">
              All registered organisations (newest first).
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="w-fit">
            <Link href="/">Back to home</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Directory</CardTitle>
            <CardDescription>
              Data is loaded on the server for each request, matching{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                GET /api/organisation
              </code>
              .
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadError ? (
              <Alert variant="destructive">
                <AlertCircleIcon />
                <AlertTitle>Could not load organisations</AlertTitle>
                <AlertDescription>{loadError}</AlertDescription>
              </Alert>
            ) : organizations.length === 0 ? (
              <Alert>
                <InboxIcon />
                <AlertTitle>No organisations yet</AlertTitle>
                <AlertDescription>
                  Register one from the home page to see it listed here.
                </AlertDescription>
              </Alert>
            ) : (
              <OrganisationListTable initialRows={listRows} />
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
