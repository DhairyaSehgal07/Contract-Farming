"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/sonner";
import { parseApiJson } from "@/lib/parse-api-json";
import { PencilIcon, TrashIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type OrganisationListRow = {
  id: string;
  name: string;
  contactDetails: {
    phone?: string;
    email?: string;
    address?: string;
  };
  isActive: boolean;
  createdAt?: string | null;
};

type OrganisationPutResponse =
  | {
      success: true;
      message?: string;
      data: {
        id: string;
        name: string;
        contactDetails: OrganisationListRow["contactDetails"];
        isActive: boolean;
        createdAt?: string;
        updatedAt?: string;
      };
    }
  | { success: false; message?: string };

type OrganisationDeleteResponse =
  | {
      success: true;
      message?: string;
      data: { id: string; name: string };
    }
  | { success: false; message?: string };

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

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

type OrganisationListTableProps = {
  initialRows: OrganisationListRow[];
};

export function OrganisationListTable({
  initialRows,
}: OrganisationListTableProps) {
  const router = useRouter();
  const [rows, setRows] = React.useState(initialRows);

  React.useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  const [editOpen, setEditOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<OrganisationListRow | null>(
    null,
  );
  const [formName, setFormName] = React.useState("");
  const [formPhone, setFormPhone] = React.useState("");
  const [formEmail, setFormEmail] = React.useState("");
  const [formAddress, setFormAddress] = React.useState("");
  const [formActive, setFormActive] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const [deleteTarget, setDeleteTarget] =
    React.useState<OrganisationListRow | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  function openEdit(row: OrganisationListRow) {
    setEditing(row);
    setFormName(row.name);
    setFormPhone(row.contactDetails.phone ?? "");
    setFormEmail(row.contactDetails.email ?? "");
    setFormAddress(row.contactDetails.address ?? "");
    setFormActive(row.isActive);
    setEditOpen(true);
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;

    const name = formName.trim();
    if (name.length < 2) {
      toast.error("Name must be at least 2 characters.", {
        description: "Use at least two characters for the organisation name.",
      });
      return;
    }

    const emailTrim = formEmail.trim();
    if (
      emailTrim.length > 0 &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)
    ) {
      toast.error("Enter a valid email address.", {
        description: "Fix the email field or leave it empty.",
      });
      return;
    }

    setSaving(true);
    const toastId = toast.loading("Saving changes…");
    try {
      const res = await fetch("/api/organisation", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editing.id,
          name,
          contactDetails: {
            phone: formPhone.trim() || undefined,
            email: emailTrim || undefined,
            address: formAddress.trim() || undefined,
          },
          isActive: formActive,
        }),
      });

      const parsed = await parseApiJson<OrganisationPutResponse>(res);

      if (!parsed.ok) {
        toast.error(parsed.message, { id: toastId });
        return;
      }

      const body = parsed.data;
      if (!body.success) {
        toast.error(body.message ?? "Could not update organisation.", {
          id: toastId,
        });
        return;
      }

      const d = body.data;
      setRows((prev) =>
        prev.map((r) =>
          r.id === String(d.id)
            ? {
                ...r,
                name: d.name,
                contactDetails: d.contactDetails ?? {},
                isActive: d.isActive,
                createdAt: r.createdAt,
              }
            : r,
        ),
      );
      toast.success(body.message ?? "Organisation updated.", {
        id: toastId,
        description: d.name,
      });
      setEditOpen(false);
      setEditing(null);
      router.refresh();
    } catch {
      toast.error("Could not reach the server.", {
        id: toastId,
        description: "Check your connection and try again.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;

    setDeleting(true);
    const toastId = toast.loading("Deleting organisation…");
    const targetId = deleteTarget.id;
    const targetName = deleteTarget.name;
    try {
      const res = await fetch(
        `/api/organisation?id=${encodeURIComponent(targetId)}`,
        { method: "DELETE" },
      );
      const parsed = await parseApiJson<OrganisationDeleteResponse>(res);

      if (!parsed.ok) {
        toast.error(parsed.message, { id: toastId });
        return;
      }

      const body = parsed.data;
      if (!body.success) {
        toast.error(body.message ?? "Could not delete organisation.", {
          id: toastId,
        });
        return;
      }

      setRows((prev) => prev.filter((r) => r.id !== targetId));
      toast.success(body.message ?? "Organisation deleted.", {
        id: toastId,
        description: targetName,
      });
      setDeleteTarget(null);
      router.refresh();
    } catch {
      toast.error("Could not reach the server.", {
        id: toastId,
        description: "Check your connection and try again.",
      });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="hidden md:table-cell">Contact</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden lg:table-cell">Created</TableHead>
            <TableHead className="w-[1%] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((organization) => (
            <TableRow key={organization.id}>
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
                  ? dateFormatter.format(new Date(organization.createdAt))
                  : "—"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => openEdit(organization)}
                    aria-label={`Edit ${organization.name}`}
                  >
                    <PencilIcon className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteTarget(organization)}
                    aria-label={`Delete ${organization.name}`}
                  >
                    <TrashIcon className="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Sheet
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditing(null);
        }}
      >
        <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Edit organisation</SheetTitle>
            <SheetDescription>
              Update details and status. Changes apply immediately.
            </SheetDescription>
          </SheetHeader>
          {editing ? (
            <form
              onSubmit={handleSaveEdit}
              className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4"
            >
              <div className="space-y-2">
                <label htmlFor="org-name" className="text-sm font-medium">
                  Name
                </label>
                <Input
                  id="org-name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  minLength={2}
                  autoComplete="organization"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="org-phone" className="text-sm font-medium">
                  Phone
                </label>
                <Input
                  id="org-phone"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  inputMode="tel"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="org-email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="org-email"
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="org-address" className="text-sm font-medium">
                  Address
                </label>
                <Textarea
                  id="org-address"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between gap-4 rounded-md border border-border px-3 py-2">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Active</p>
                  <p className="text-xs text-muted-foreground">
                    Inactive organisations can be hidden from workflows.
                  </p>
                </div>
                <Switch
                  checked={formActive}
                  onCheckedChange={setFormActive}
                  aria-label="Organisation active"
                />
              </div>
              <SheetFooter className="flex-row justify-end gap-2 sm:space-x-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Save changes"}
                </Button>
              </SheetFooter>
            </form>
          ) : null}
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete organisation?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `This will permanently remove "${deleteTarget.name}". This action cannot be undone.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={(e) => {
                e.preventDefault();
                void handleConfirmDelete();
              }}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
