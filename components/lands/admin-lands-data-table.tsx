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
  type Row,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ArrowUpDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  MapPinIcon,
  MoreHorizontalIcon,
  PencilIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  Trash2Icon,
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
import { NumberInput } from "@/components/ui/number-input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { toast } from "@/components/ui/sonner";
import type { FarmerListItem } from "@/lib/data/farmers";
import type { LandListItem } from "@/lib/data/lands";
import { queryFetchEnvelopeData } from "@/lib/query/http";
import { registerLandFormSchema } from "@/lib/schemas/land-register";
import { updateLandSchema, type UpdateLandFormValues } from "@/lib/schemas/land-update";
import { LAND_AREA_UNITS } from "@/lib/land/constants";
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

function landGlobalFilter(row: Row<LandListItem>, _columnId: string, value: unknown) {
  const q = String(value ?? "").trim().toLowerCase();
  if (!q) return true;
  const l = row.original;
  const areaStr = `${l.area.value} ${l.area.unit}`;
  return (
    l.name.toLowerCase().includes(q) ||
    l.farmerName.toLowerCase().includes(q) ||
    areaStr.toLowerCase().includes(q)
  );
}

function formatArea(l: LandListItem) {
  return `${l.area.value} ${l.area.unit}`;
}

function computeGeoForPatch(
  land: LandListItem,
  lat: string,
  lng: string,
): { latitude: number; longitude: number } | null | undefined {
  const lt = lat.trim();
  const lg = lng.trim();
  if (!lt && !lg) {
    if (land.geoLocation) return null;
    return undefined;
  }
  if (lt && lg) {
    return { latitude: Number(lt), longitude: Number(lg) };
  }
  return undefined;
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

type AdminLandsDataTableProps = {
  initialLands: LandListItem[];
  farmers: FarmerListItem[];
};

export function AdminLandsDataTable({ initialLands, farmers }: AdminLandsDataTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [editing, setEditing] = React.useState<LandListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<LandListItem | null>(null);

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string;
      values: UpdateLandFormValues;
    }) =>
      queryFetchEnvelopeData(`/api/land/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      }),
    onSuccess: () => {
      toast.success("Land updated");
      setEditing(null);
      router.refresh();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Could not update land");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      queryFetchEnvelopeData<{ id: string }>(`/api/land/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.success("Land deleted");
      setDeleteTarget(null);
      router.refresh();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Could not delete land");
    },
  });

  const columns = React.useMemo<ColumnDef<LandListItem>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Land" />
        ),
        cell: ({ row }) => (
          <span className="font-medium">{row.getValue("name")}</span>
        ),
      },
      {
        accessorKey: "farmerName",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Farmer" />
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.farmerName}</span>
        ),
      },
      {
        id: "area",
        accessorFn: (row) => formatArea(row),
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Area" />
        ),
        cell: ({ row }) => (
          <span className="tabular-nums text-muted-foreground">{formatArea(row.original)}</span>
        ),
      },
      {
        id: "geo",
        header: "GPS",
        cell: ({ row }) => {
          const has = Boolean(row.original.geoLocation);
          return (
            <Badge variant={has ? "secondary" : "outline"}>
              {has ? "Saved" : "—"}
            </Badge>
          );
        },
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
        id: "view",
        enableHiding: false,
        header: () => <span className="sr-only">View</span>,
        cell: ({ row }) => {
          const land = row.original;
          return (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="min-h-9 min-w-9"
              aria-label={`View ${land.name}`}
              onClick={() => router.push(`/admin/lands/${land.id}`)}
            >
              <EyeIcon className="size-4" aria-hidden />
            </Button>
          );
        },
        enableSorting: false,
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const land = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="min-h-9 min-w-9"
                  aria-label={`Actions for ${land.name}`}
                >
                  <MoreHorizontalIcon className="size-4" aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setEditing(land)}>
                  <PencilIcon className="size-4" aria-hidden />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setDeleteTarget(land)}
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
    [router],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table manages table state internally
  const table = useReactTable({
    data: initialLands,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: landGlobalFilter,
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
          <CardTitle className="text-base">Your lands</CardTitle>
          <CardDescription>
            Search, sort, and manage parcels. Each land is unique per farmer by name.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {initialLands.length === 0 ? (
            <Empty className="border-border/60 bg-muted/20">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <MapPinIcon className="size-4" aria-hidden />
                </EmptyMedia>
                <EmptyTitle>No lands yet</EmptyTitle>
                <EmptyDescription>
                  Register a land with the button above once you have at least one farmer.
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
                    placeholder="Search land, farmer, or area…"
                    value={globalFilter ?? ""}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="h-11 min-h-11 pl-9"
                    aria-label="Search lands"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="min-h-9 gap-2"
                      >
                        <SlidersHorizontalIcon className="size-4" aria-hidden />
                        Status
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() =>
                          table.getColumn("isActive")?.setFilterValue(undefined)
                        }
                      >
                        All
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          table.getColumn("isActive")?.setFilterValue("active")
                        }
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
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="min-h-9 gap-2"
                      >
                        Columns
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {table
                        .getAllColumns()
                        .filter((column) => column.getCanHide())
                        .map((column) => {
                          const label: Record<string, string> = {
                            name: "Land",
                            farmerName: "Farmer",
                            area: "Area",
                            geo: "GPS",
                            isActive: "Status",
                            createdAt: "Added",
                            view: "View",
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
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                        >
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
                          No lands match your filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  {table.getFilteredRowModel().rows.length} land
                  {table.getFilteredRowModel().rows.length === 1 ? "" : "s"}
                  {globalFilter.trim() || columnFilters.length ? " (filtered)" : ""}
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
        <LandEditSheet
          key={editing.id}
          land={editing}
          farmers={farmers}
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
            <AlertDialogTitle>Delete land?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              <span className="font-medium text-foreground">{deleteTarget?.name}</span>{" "}
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

function LandEditSheet({
  land,
  farmers,
  open,
  onOpenChange,
  isPending,
  onSubmit,
}: {
  land: LandListItem;
  farmers: FarmerListItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending: boolean;
  onSubmit: (values: UpdateLandFormValues) => void;
}) {
  const form = useForm({
    defaultValues: {
      name: land.name,
      farmerId: land.farmerId,
      areaValue: land.area.value,
      areaUnit: land.area.unit,
      latitude: land.geoLocation ? String(land.geoLocation.latitude) : "",
      longitude: land.geoLocation ? String(land.geoLocation.longitude) : "",
      isActive: land.isActive,
    },
    validators: {
      onSubmit: registerLandFormSchema,
    },
    onSubmit: async ({ value }) => {
      const geo = computeGeoForPatch(land, value.latitude, value.longitude);
      const body: Record<string, unknown> = {
        name: value.name,
        farmerId: value.farmerId,
        area: { value: value.areaValue, unit: value.areaUnit },
        isActive: value.isActive,
      };
      if (geo === null) body.geoLocation = null;
      else if (geo) body.geoLocation = geo;

      const parsed = updateLandSchema.safeParse(body);
      if (!parsed.success) {
        toast.error(parsed.error.issues[0]?.message ?? "Invalid update payload");
        return;
      }
      onSubmit(parsed.data);
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
          <SheetTitle>Edit land</SheetTitle>
          <SheetDescription>Update details for {land.name}.</SheetDescription>
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
            <form.Field name="name">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                const err = fieldErrorText(field.state.meta.errors);
                return (
                  <div
                    className={cn("space-y-2", isInvalid && "text-destructive")}
                    data-invalid={isInvalid || undefined}
                  >
                    <Label htmlFor="edit-land-name" className="text-sm font-medium">
                      Land name
                    </Label>
                    <Input
                      id="edit-land-name"
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

            <form.Field name="farmerId">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                const err = fieldErrorText(field.state.meta.errors);
                return (
                  <div
                    className={cn("space-y-2", isInvalid && "text-destructive")}
                    data-invalid={isInvalid || undefined}
                  >
                    <Label htmlFor="edit-land-farmer" className="text-sm font-medium">
                      Farmer
                    </Label>
                    <Select
                      value={field.state.value}
                      onValueChange={(v) => field.handleChange(v)}
                    >
                      <SelectTrigger
                        id="edit-land-farmer"
                        className={cn(
                          "h-11 min-h-11 w-full rounded-lg",
                          isInvalid && "border-destructive",
                        )}
                        aria-invalid={isInvalid}
                      >
                        <SelectValue placeholder="Select farmer" />
                      </SelectTrigger>
                      <SelectContent>
                        {farmers.map((f) => (
                          <SelectItem key={f.id} value={f.id}>
                            {f.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isInvalid && err ? (
                      <p className="text-xs text-destructive">{err}</p>
                    ) : null}
                  </div>
                );
              }}
            </form.Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <form.Field name="areaValue">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  const err = fieldErrorText(field.state.meta.errors);
                  return (
                    <div
                      className={cn("space-y-2", isInvalid && "text-destructive")}
                      data-invalid={isInvalid || undefined}
                    >
                      <Label htmlFor="edit-land-area-value" className="text-sm font-medium">
                        Area
                      </Label>
                      <NumberInput
                        id="edit-land-area-value"
                        name={field.name}
                        inputMode="decimal"
                        min={0}
                        step="any"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(Number(e.target.value))}
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

              <form.Field name="areaUnit">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="edit-land-area-unit" className="text-sm font-medium">
                      Unit
                    </Label>
                    <Select
                      value={field.state.value}
                      onValueChange={(v) =>
                        field.handleChange(v as (typeof LAND_AREA_UNITS)[number])
                      }
                    >
                      <SelectTrigger
                        id="edit-land-area-unit"
                        className="h-11 min-h-11 w-full rounded-lg"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LAND_AREA_UNITS.map((u) => (
                          <SelectItem key={u} value={u}>
                            {u}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </form.Field>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">GPS (optional)</p>
              <p className="text-xs text-muted-foreground">
                Clear both fields to remove saved coordinates from this land.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <form.Field name="latitude">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    const err = fieldErrorText(field.state.meta.errors);
                    return (
                      <div
                        className={cn("space-y-2", isInvalid && "text-destructive")}
                        data-invalid={isInvalid || undefined}
                      >
                        <Label htmlFor="edit-land-lat" className="text-sm font-medium">
                          Latitude
                        </Label>
                        <Input
                          id="edit-land-lat"
                          name={field.name}
                          inputMode="decimal"
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
                <form.Field name="longitude">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    const err = fieldErrorText(field.state.meta.errors);
                    return (
                      <div
                        className={cn("space-y-2", isInvalid && "text-destructive")}
                        data-invalid={isInvalid || undefined}
                      >
                        <Label htmlFor="edit-land-lng" className="text-sm font-medium">
                          Longitude
                        </Label>
                        <Input
                          id="edit-land-lng"
                          name={field.name}
                          inputMode="decimal"
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
              </div>
            </div>

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
                      <Label htmlFor="edit-land-active" className="text-sm font-medium">
                        Active
                      </Label>
                      {isInvalid && err ? (
                        <p className="text-xs text-destructive">{err}</p>
                      ) : null}
                    </div>
                    <Switch
                      id="edit-land-active"
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
