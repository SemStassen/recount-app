import type { Task } from "@recount/core/modules/project";
import type { ProjectId } from "@recount/core/shared/schemas";
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
import { Link } from "@tanstack/react-router";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

import { createTaskDialogHandle } from "~/routes/_app/$workspaceSlug/-components/create-task-dialog";

type TaskListItem = Pick<Task, "id" | "name">;

const columnHelper = createColumnHelper<TaskListItem>();

const columns = [
  columnHelper.accessor("name", {
    header: "Name",
    cell: (info) => <span className="line-clamp-1">{info.getValue()}</span>,
    enableSorting: true,
    meta: {
      grow: true,
    },
  }),
];

interface TasksListProps {
  projectId: ProjectId;
  tasks: Array<TaskListItem>;
}

export function TasksList({ projectId, tasks }: TasksListProps) {
  const table = useReactTable({
    data: tasks,
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

  return tasks.length > 0 ? (
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
                <Link
                  to="/$workspaceSlug/tasks/$taskId"
                  from="/$workspaceSlug"
                  params={{
                    taskId: row.original.id,
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
        <EmptyTitle>No tasks found</EmptyTitle>
        <EmptyDescription>Create a task to get started</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          variant="outline"
          onClick={() =>
            createTaskDialogHandle.openWithPayload({
              initialProjectId: projectId,
            })
          }
        >
          New task
        </Button>
      </EmptyContent>
    </Empty>
  );
}
