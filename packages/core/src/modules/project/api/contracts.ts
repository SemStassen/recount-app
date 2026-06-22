import { Schema } from "effect";

import { Project, Task } from "../index";

export const CreateProjectCommand = Project.jsonCreate;
export const CreateProjectResult = Project.json;

export const UpdateProjectCommand = Schema.Struct({
  id: Project.fields.id,
  data: Project.jsonUpdate,
});
export const UpdateProjectResult = Project.json;

export const ArchiveProjectCommand = Schema.Struct({
  id: Project.fields.id,
});
export const ArchiveProjectResult = Schema.Void;

export const UnarchiveProjectCommand = Schema.Struct({
  id: Project.fields.id,
});
export const UnarchiveProjectResult = Schema.Void;

export const CreateTaskCommand = Task.jsonCreate;
export const CreateTaskRpcCommand = Task.jsonCreate.mapFields((fields) => ({
  ...fields,
  id: Task.fields.id,
}));
export const CreateTaskResult = Task.json;

export const UpdateTaskCommand = Schema.Struct({
  id: Task.fields.id,
  data: Task.jsonUpdate,
});
export const UpdateTaskResult = Task.json;

export const ArchiveTaskCommand = Schema.Struct({
  id: Task.fields.id,
});
export const ArchiveTaskResult = Schema.Void;

export const UnarchiveTaskCommand = Schema.Struct({
  id: Task.fields.id,
});
export const UnarchiveTaskResult = Schema.Void;
