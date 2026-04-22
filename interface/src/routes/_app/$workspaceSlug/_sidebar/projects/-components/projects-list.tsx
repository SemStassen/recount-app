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
import { useLiveQuery } from "@tanstack/react-db";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { DateTime, Option } from "effect";
import { useMemo, useRef } from "react";

import { projectSidebarAtom } from "~/atoms/ui-atoms";
import { useWorkspaceDb } from "~/db/workspace/context";
import { useDateTimeFormatter } from "~/lib/utils/date-time";

const columnHelper = createColumnHelper<Project>();

const createColumns = (formatDate: (date: Date) => string) => [
  columnHelper.accessor("hexColor", {
    header: undefined,
    size: 48,
    cell: (info) => (
      <div
        className="size-4 rounded-sm"
        style={{ backgroundColor: `${info.getValue()}` }}
      />
    ),
    enableSorting: true,
  }),
  columnHelper.accessor("name", {
    header: "Name",
    size: 200,
    cell: (info) => info.getValue(),
    enableSorting: true,
    meta: { grow: true },
  }),
  columnHelper.accessor("startDate", {
    header: "Start Date",
    size: 120,
    cell: (info) => {
      const value = info.getValue();
      if (Option.isSome(value)) {
        return formatDate(DateTime.toDateUtc(value.value));
      }
      return null;
    },
    enableSorting: true,
  }),
  columnHelper.accessor("targetDate", {
    header: "Target Date",
    size: 120,
    cell: (info) => {
      const value = info.getValue();
      if (Option.isSome(value)) {
        return formatDate(DateTime.toDateUtc(value.value));
      }
      return null;
    },
    enableSorting: true,
  }),
  columnHelper.accessor("isBillable", {
    header: "Billable",
    size: 80,
    cell: (info) => (info.getValue() ? "Yes" : "No"),
    enableSorting: true,
  }),
];

export function ProjectsList() {
  const formatter = useDateTimeFormatter();
  const setProjectSidebar = useAtomSet(projectSidebarAtom);

  const workspaceDb = useWorkspaceDb();
  const { data: projects } = useLiveQuery((q) =>
    q.from({ p: workspaceDb.collections.projectsCollection })
  );

  const columns = useMemo(() => createColumns(formatter.date), [formatter]);

  const table = useReactTable({
    data: projects ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableSorting: true,
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
    <List style={{ gridTemplateColumns }}>
      <ListHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <ListRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <ListHead
                key={header.id}
                onClick={header.column.getToggleSortingHandler()}
                isSorted={header.column.getIsSorted()}
                canSort={header.column.getCanSort()}
              >
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
      <ListBody ref={parentRef}>
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
