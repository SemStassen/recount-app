import { Schema } from "effect";

export class ProjectArchivedError extends Schema.TaggedErrorClass<ProjectArchivedError>()(
  "project/ProjectArchivedError",
  {}
) {}
