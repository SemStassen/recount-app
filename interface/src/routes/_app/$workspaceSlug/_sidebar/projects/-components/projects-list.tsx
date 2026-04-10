import { useAtomSet } from "@effect/atom-react";
import type { Project } from "@recount/core/modules/project";
import { Button } from "@recount/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@recount/ui/empty";
import { Icons } from "@recount/ui/icons";
import {
  List,
  ListBody,
  ListCell,
  ListHead,
  ListHeader,
  ListRow,
} from "@recount/ui/list";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useMemo, useRef } from "react";

import { projectSidebarAtom } from "~/atoms/ui-atoms";
import { useWorkspaceLiveQuery } from "~/db/workspace-collections";
import { useDateTimeFormatter } from "~/lib/utils/date-time";

const createColumns: (
  formatDate: (date: Date) => string
) => Array<ColumnDef<Project>> = (formatDate) => [
  {
    accessorKey: "hexColor",
    header: undefined,
    cell: (info) => (
      <div
        className="size-4 rounded-sm"
        style={{ backgroundColor: `${info.getValue()}` }}
      />
    ),
    size: 48,
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: (info) => info.getValue() && formatDate(info.getValue<Date>()),
    size: 120,
  },
  {
    accessorKey: "targetDate",
    header: "Target Date",
    cell: (info) => info.getValue() && formatDate(info.getValue<Date>()),
    size: 120,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: (info) => info.getValue(),
    meta: { grow: true },
    size: 200,
  },
  {
    accessorKey: "isBillable",
    header: "Billable",
    cell: (info) => (info.getValue() ? "Yes" : "No"),
    size: 80,
  },
];

export function ProjectsList() {
  const formatter = useDateTimeFormatter();
  const setProjectSidebar = useAtomSet(projectSidebarAtom);
  const { data: projects } = useWorkspaceLiveQuery((q, db) =>
    q.from({ p: db.projectsCollection })
  );

  const columns = useMemo(() => createColumns(formatter.date), [formatter]);

  const table = useReactTable({
    data: projects ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const { rows } = table.getRowModel();

  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 34,
    overscan: 10,
  });

  const gridTemplateColumns = table
    .getVisibleLeafColumns()
    .map((col) => (col.columnDef.meta?.grow ? "1fr" : `${col.getSize()}px`))
    .join(" ");

  return projects && projects.length > 0 ? (
    <List style={{ gridTemplateColumns }} ref={parentRef}>
      <ListHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <ListRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <ListHead key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
              </ListHead>
            ))}
          </ListRow>
        ))}
      </ListHeader>
      <ListBody>
        {virtualizer.getVirtualItems().map((virtualRow, index) => {
          const row = rows[virtualRow.index];
          return (
            <ListRow
              key={row.id}
              render={
                <button
                  onClick={() =>
                    setProjectSidebar({
                      mode: "edit",
                      projectId: row.original.id,
                    })
                  }
                  type="button"
                />
              }
              style={{
                height: `${virtualRow.size}px`,
                transform: `translateY(${
                  virtualRow.start - index * virtualRow.size
                }px)`,
              }}
            >
              {row.getVisibleCells().map((cell) => (
                <ListCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </ListCell>
              ))}
            </ListRow>
          );
        })}
      </ListBody>
    </List>
  ) : (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icons.Folder size={36} />
        </EmptyMedia>
        <EmptyTitle>No projects found</EmptyTitle>
        <EmptyDescription>Create a project to get started</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          variant="outline"
          onClick={() => setProjectSidebar({ mode: "create" })}
        >
          New project
        </Button>
      </EmptyContent>
    </Empty>
  );
}
