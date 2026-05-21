import type { Project } from "@recount/core/modules/project";
import type { ProjectId } from "@recount/core/shared/schemas";
import { Button } from "@recount/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@recount/ui/context-menu";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@recount/ui/empty";
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
import { Exit } from "effect";
import { useMemo, useRef } from "react";

import { useWorkspaceDb } from "~/db/workspace/context";
import { useWorkspaceMutation } from "~/lib/rpc/workspace-mutation";

const columnHelper = createColumnHelper<Project>();

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
];

export function ArchivedProjectsList() {
  const workspaceDb = useWorkspaceDb();
  const { data: projects } = useLiveQuery((q) =>
    q.from({ p: workspaceDb.collections.archivedProjectsCollection })
  );

  const unarchiveProject = useWorkspaceMutation("Project.Unarchive");

  const handleUnarchiveProject = async (projectId: ProjectId) => {
    const exit = await unarchiveProject({
      payload: {
        id: projectId,
      },
    });

    Exit.match(exit, {
      onSuccess: () => {
        const toastId = `project-unarchive-${projectId}`;

        toastManager.add({
          id: toastId,
          type: "success",
          title: "Project restored",
          description: (
            <Button
              variant="ghost"
              render={
                <Link
                  to="/$workspaceSlug/projects/$projectId"
                  from="/$workspaceSlug"
                  params={{ projectId }}
                  onClick={() => toastManager.close(toastId)}
                >
                  View project
                </Link>
              }
            />
          ),
        });
      },
      onFailure: () => {
        toastManager.add({
          type: "error",
          title: "Something went wrong",
        });
      },
    });
  };

  const columns = useMemo(() => createColumns(), []);

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
            <ContextMenu key={row.id}>
              <ContextMenuTrigger
                render={
                  <ListRow
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
                  onClick={() => handleUnarchiveProject(row.original.id)}
                >
                  Unarchive
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
      </EmptyHeader>
    </Empty>
  );
}
