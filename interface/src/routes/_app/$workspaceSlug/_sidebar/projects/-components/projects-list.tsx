import type { ProjectId } from "@recount/core/shared/schemas";
import { Button } from "@recount/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@recount/ui/context-menu";
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
import { toastManager } from "@recount/ui/toast";
import { useLiveQuery } from "@tanstack/react-db";
import { Link } from "@tanstack/react-router";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useMemo, useRef } from "react";

import type { ProjectCollectionRow } from "~/db/synced-collections";
import { useWorkspaceDb } from "~/db/workspace/context";

import { createProjectDialogHandle } from "../../../-components/create-project-dialog";

const columnHelper = createColumnHelper<ProjectCollectionRow>();

const createColumns = () => [
  columnHelper.accessor("color", {
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
    cell: (info) => <span className="line-clamp-1">{info.getValue()}</span>,
    enableSorting: true,
    meta: { grow: true },
  }),
  columnHelper.accessor("isBillable", {
    header: "Billable",
    size: 80,
    cell: (info) => (info.getValue() ? "Yes" : "No"),
    enableSorting: true,
  }),
];

export function ProjectsList() {
  const workspaceDb = useWorkspaceDb();
  const { data: projects } = useLiveQuery((q) =>
    q.from({ p: workspaceDb.collections.activeProjectsCollection })
  );

  const handleArchiveProject = (projectId: ProjectId) => {
    try {
      workspaceDb.actions.archiveProject(projectId);
    } catch {
      toastManager.add({
        type: "error",
        title: "Something went wrong",
      });
      return;
    }

    const toastId = `project-archive-${projectId}`;

    toastManager.add({
      id: toastId,
      type: "success",
      title: "Project archived",
      description: (
        <Button
          variant="ghost"
          render={
            <Link
              to="/$workspaceSlug/archive/projects"
              from="/$workspaceSlug"
              onClick={() => toastManager.close(toastId)}
            >
              View archive
            </Link>
          }
        />
      ),
    });
  };

  const columns = useMemo(() => createColumns(), []);

  const table = useReactTable({
    data: projects,
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

  return projects.length > 0 ? (
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
            <ContextMenu key={row.id}>
              <ContextMenuTrigger
                render={
                  <ListRow
                    render={
                      <Link
                        to="/$workspaceSlug/projects/$projectId"
                        from="/$workspaceSlug"
                        params={{
                          projectId: row.original.id,
                        }}
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
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </ListCell>
                    ))}
                  </ListRow>
                }
              />
              <ContextMenuContent>
                <ContextMenuItem
                  render={
                    <Link
                      from="/$workspaceSlug"
                      to="/$workspaceSlug/projects/$projectId"
                      params={{
                        projectId: row.original.id,
                      }}
                    >
                      Open project...
                    </Link>
                  }
                />
                <ContextMenuSeparator />
                <ContextMenuItem
                  onClick={() => handleArchiveProject(row.original.id)}
                >
                  Archive
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
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
          onClick={() => createProjectDialogHandle.open(null)}
        >
          New project
        </Button>
      </EmptyContent>
    </Empty>
  );
}
