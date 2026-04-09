import { Schema } from "effect";

export class ProjectArchivedError extends Schema.TaggedErrorClass<ProjectArchivedError>()(
  "project/ProjectArchivedError",
  {}
) {}

export class ProjectTargetDateBeforeStartDateError extends Schema.TaggedErrorClass<ProjectTargetDateBeforeStartDateError>()(
  "project/ProjectTargetDateBeforeStartDateError",
  {}
) {}
