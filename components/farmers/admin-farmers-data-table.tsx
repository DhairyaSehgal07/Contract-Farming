"use client";

import * as React from "react";
import { useForm } from "@tanstack/react-form";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type Row,
  type VisibilityState,
} from "@tanstack/react-table";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ArrowUpDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
  PencilIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";

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
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import type { FarmerListItem } from "@/lib/data/farmers";
import { queryFetchEnvelopeData } from "@/lib/query/http";
import {
  updateFarmerSchema,
  type UpdateFarmerFormValues,
} from "@/lib/schemas/farmer-update";
import { cn } from "@/lib/utils";

function fieldErrorText(errors: unknown[] | undefined): string | undefined {
  if (!errors?.length) return undefined;
  const first = errors[0];
  if (typeof first === "string") return first;
  if (first && typeof first === "object" && "message" in first) {
    return String((first as { message?: string }).message);
  }
  return undefined;
}

function farmerGlobalFilter(row: Row<FarmerListItem>, _columnId: string, value: unknown) {
  const q = String(value ?? "").trim().toLowerCase();
  if (!q) return true;
  const f = row.original;
  return (
    f.fullName.toLowerCase().includes(q) ||
    f.mobileNumber.toLowerCase().includes(q) ||
    f.address.toLowerCase().includes(q)
  );
}

function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: {
  column: Column<TData, TValue>;
  title: string;
  className?: string;
}) {
  if (!column.getCanSort()) {
    return <span className={className}>{title}</span>;
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn("-ml-2 h-8 gap-1 font-medium data-[state=open]:bg-accent", className)}
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {title}
      <ArrowUpDownIcon className="size-4 shrink-0 opacity-60" aria-hidden />
    </Button>
  );
}

type AdminFarmersDataTableProps = {
  initialFarmers: FarmerListItem[];
};

export function AdminFarmersDataTable({ initialFarmers }: AdminFarmersDataTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [editing, setEditing] = React.useState<FarmerListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<FarmerListItem | null>(null);

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string;
      values: UpdateFarmerFormValues;
    }) =>
      queryFetchEnvelopeData<FarmerListItem>(`/api/farmer/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      }),
    onSuccess: () => {
      toast.success("Farmer updated");
      setEditing(null);
      router.refresh();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Could not update farmer");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      queryFetchEnvelopeData<{ id: string }>(`/api/farmer/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.success("Farmer deleted");
      setDeleteTarget(null);
      router.refresh();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Could not delete farmer");
    },
  });

  const columns = React.useMemo<ColumnDef<FarmerListItem>[]>(
    () => [
      {
        accessorKey: "fullName",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => (
          <span className="font-medium">{row.getValue("fullName")}</span>
        ),
      },
      {
        accessorKey: "mobileNumber",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Mobile" />
        ),
        cell: ({ row }) => (
          <span className="tabular-nums text-muted-foreground">
            {row.getValue("mobileNumber")}
          </span>
        ),
      },
      {
        accessorKey: "address",
        header: "Address",
        cell: ({ row }) => (
          <span className="max-w-[min(280px,40vw)] truncate text-muted-foreground">
            {row.getValue("address")}
          </span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => {
          const active = row.original.isActive;
          return (
            <Badge variant={active ? "secondary" : "outline"}>
              {active ? "Active" : "Inactive"}
            </Badge>
          );
        },
        filterFn: (row, _id, value: unknown) => {
          if (value === undefined || value === "all") return true;
          if (value === "active") return row.original.isActive;
          if (value === "inactive") return !row.original.isActive;
          return true;
        },
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Added" />
        ),
        cell: ({ row }) => (
          <span className="tabular-nums text-muted-foreground">
            {format(new Date(row.original.createdAt), "MMM d, yyyy")}
          </span>
        ),
        sortingFn: (a, b) =>
          new Date(a.original.createdAt).getTime() -
          new Date(b.original.createdAt).getTime(),
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const farmer = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="min-h-9 min-w-9"
                  aria-label={`Actions for ${farmer.fullName}`}
                >
                  <MoreHorizontalIcon className="size-4" aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setEditing(farmer)}>
                  <PencilIcon className="size-4" aria-hidden />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setDeleteTarget(farmer)}
                >
                  <Trash2Icon className="size-4" aria-hidden />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table manages table state internally
  const table = useReactTable({
    data: initialFarmers,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: farmerGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  return (
    <>
      <Card className="border-border/60">
        <CardHeader className="space-y-1">
          <CardTitle className="text-base">Your farmers</CardTitle>
          <CardDescription>
            Search, sort, and manage profiles. Use column options to show or hide
            fields.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {initialFarmers.length === 0 ? (
            <Empty className="border-border/60 bg-muted/20">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <UsersIcon className="size-4" aria-hidden />
                </EmptyMedia>
                <EmptyTitle>No farmers yet</EmptyTitle>
                <EmptyDescription>
                  Add a farmer with the button above to see them listed here.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-sm flex-1">
              <SearchIcon
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                placeholder="Search name, mobile, or address…"
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="h-11 min-h-11 pl-9"
                aria-label="Search farmers"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="outline" size="sm" className="min-h-9 gap-2">
                    <SlidersHorizontalIcon className="size-4" aria-hidden />
                    Status
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => table.getColumn("isActive")?.setFilterValue(undefined)}
                  >
                    All
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => table.getColumn("isActive")?.setFilterValue("active")}
                  >
                    Active only
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      table.getColumn("isActive")?.setFilterValue("inactive")
                    }
                  >
                    Inactive only
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="outline" size="sm" className="min-h-9 gap-2">
                    Columns
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      const label: Record<string, string> = {
                        fullName: "Name",
                        mobileNumber: "Mobile",
                        address: "Address",
                        isActive: "Status",
                        createdAt: "Added",
                      };
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) => column.toggleVisibility(!!value)}
                        >
                          {label[column.id] ?? column.id}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="rounded-lg border border-border/60">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No farmers match your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {table.getFilteredRowModel().rows.length} farmer
              {table.getFilteredRowModel().rows.length === 1 ? "" : "s"}
              {globalFilter.trim() || columnFilters.length
                ? " (filtered)"
                : ""}
            </p>
            <div className="flex items-center gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-h-9"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeftIcon className="size-4" aria-hidden />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              <span className="text-sm text-muted-foreground tabular-nums">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount() || 1}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-h-9"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRightIcon className="size-4" aria-hidden />
              </Button>
            </div>
          </div>
            </>
          )}
        </CardContent>
      </Card>

      {editing ? (
        <FarmerEditSheet
          key={editing.id}
          farmer={editing}
          open={Boolean(editing)}
          onOpenChange={(open) => !open && setEditing(null)}
          isPending={updateMutation.isPending}
          onSubmit={(values) => updateMutation.mutate({ id: editing.id, values })}
        />
      ) : null}

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete farmer?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.fullName}
              </span>{" "}
              from your organization. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (deleteTarget) {
                  deleteMutation.mutate(deleteTarget.id);
                }
              }}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function FarmerEditSheet({
  farmer,
  open,
  onOpenChange,
  isPending,
  onSubmit,
}: {
  farmer: FarmerListItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending: boolean;
  onSubmit: (values: UpdateFarmerFormValues) => void;
}) {
  const form = useForm({
    defaultValues: {
      fullName: farmer.fullName,
      address: farmer.address,
      mobileNumber: farmer.mobileNumber,
      isActive: farmer.isActive,
    },
    validators: {
      onSubmit: updateFarmerSchema,
    },
    onSubmit: async ({ value }) => {
      onSubmit(value);
    },
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="flex max-h-[min(92vh,720px)] w-full flex-col gap-0 overflow-hidden rounded-t-2xl border-border/60 p-0"
        showCloseButton
      >
        <SheetHeader className="border-b border-border/60 px-4 pt-2 pb-4">
          <SheetTitle>Edit farmer</SheetTitle>
          <SheetDescription>Update profile details for {farmer.fullName}.</SheetDescription>
        </SheetHeader>

        <form
          className="flex max-h-[inherit] flex-1 flex-col overflow-hidden"
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
          noValidate
        >
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
            <form.Field name="fullName">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                const err = fieldErrorText(field.state.meta.errors);
                return (
                  <div
                    className={cn("space-y-2", isInvalid && "text-destructive")}
                    data-invalid={isInvalid || undefined}
                  >
                    <Label htmlFor="edit-farmer-full-name" className="text-sm font-medium">
                      Full name
                    </Label>
                    <Input
                      id="edit-farmer-full-name"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      className={cn(
                        "h-11 min-h-11 rounded-lg px-3",
                        isInvalid && "border-destructive",
                      )}
                    />
                    {isInvalid && err ? (
                      <p className="text-xs text-destructive">{err}</p>
                    ) : null}
                  </div>
                );
              }}
            </form.Field>

            <form.Field name="address">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                const err = fieldErrorText(field.state.meta.errors);
                return (
                  <div
                    className={cn("space-y-2", isInvalid && "text-destructive")}
                    data-invalid={isInvalid || undefined}
                  >
                    <Label htmlFor="edit-farmer-address" className="text-sm font-medium">
                      Address
                    </Label>
                    <Textarea
                      id="edit-farmer-address"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      className={cn(
                        "min-h-[120px] rounded-lg px-3 py-2",
                        isInvalid && "border-destructive",
                      )}
                    />
                    {isInvalid && err ? (
                      <p className="text-xs text-destructive">{err}</p>
                    ) : null}
                  </div>
                );
              }}
            </form.Field>

            <form.Field name="mobileNumber">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                const err = fieldErrorText(field.state.meta.errors);
                return (
                  <div
                    className={cn("space-y-2", isInvalid && "text-destructive")}
                    data-invalid={isInvalid || undefined}
                  >
                    <Label htmlFor="edit-farmer-mobile" className="text-sm font-medium">
                      Mobile number
                    </Label>
                    <Input
                      id="edit-farmer-mobile"
                      name={field.name}
                      type="tel"
                      inputMode="tel"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      className={cn(
                        "h-11 min-h-11 rounded-lg px-3 tabular-nums",
                        isInvalid && "border-destructive",
                      )}
                    />
                    {isInvalid && err ? (
                      <p className="text-xs text-destructive">{err}</p>
                    ) : null}
                  </div>
                );
              }}
            </form.Field>

            <form.Field name="isActive">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                const err = fieldErrorText(field.state.meta.errors);
                return (
                  <div
                    className={cn(
                      "flex flex-row items-center justify-between gap-4 rounded-lg border border-border/60 px-3 py-3",
                      isInvalid && "border-destructive",
                    )}
                    data-invalid={isInvalid || undefined}
                  >
                    <div className="min-w-0 space-y-0.5">
                      <Label htmlFor="edit-farmer-active" className="text-sm font-medium">
                        Active
                      </Label>
                      {isInvalid && err ? (
                        <p className="text-xs text-destructive">{err}</p>
                      ) : null}
                    </div>
                    <Switch
                      id="edit-farmer-active"
                      checked={field.state.value}
                      onCheckedChange={(v) => field.handleChange(v)}
                      aria-invalid={isInvalid}
                      className="shrink-0"
                    />
                  </div>
                );
              }}
            </form.Field>
          </div>

          <SheetFooter className="border-t border-border/60 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <Button
              type="button"
              variant="outline"
              className="min-h-11 w-full sm:w-auto"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" className="min-h-11 w-full sm:w-auto" disabled={isPending}>
              {isPending ? "Saving…" : "Save changes"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
