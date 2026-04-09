import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAllOrganizations } from "@/lib/data/organizations";

/** Always fetch fresh data; this list is driven by the same query as GET /api/organisation. */
export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatContactSummary(contact: {
  phone?: string;
  email?: string;
  address?: string;
}) {
  const parts = [contact.email, contact.phone].filter(Boolean);
  if (parts.length > 0) return parts.join(" · ");
  if (contact.address) return contact.address;
  return "—";
}

export default async function OrganisationListPage() {
  let organizations: Awaited<ReturnType<typeof getAllOrganizations>>;
  let loadError: string | null = null;

  try {
    organizations = await getAllOrganizations();
  } catch {
    organizations = [];
    loadError = "Could not load organizations. Try again later.";
  }

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
              <p className="text-sm text-destructive">{loadError}</p>
            ) : organizations.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No organisations yet. Register one from the home page.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Contact
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Created
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {organizations.map((organization) => (
                    <TableRow key={String(organization.id)}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col gap-0.5">
                          <span>{organization.name}</span>
                          <span className="text-xs text-muted-foreground md:hidden">
                            {formatContactSummary(organization.contactDetails)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden max-w-[280px] truncate text-muted-foreground md:table-cell">
                        {formatContactSummary(organization.contactDetails)}
                      </TableCell>
                      <TableCell>
                        {organization.isActive ? (
                          <Badge variant="default">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground lg:table-cell">
                        {organization.createdAt
                          ? dateFormatter.format(organization.createdAt)
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
