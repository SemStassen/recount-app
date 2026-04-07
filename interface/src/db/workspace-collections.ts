import {
  createWorkspaceCollections,
  type WorkspaceCollections,
} from "./collections";

let activeWorkspaceId: string | null = null;
let activeWorkspacePromise: Promise<WorkspaceCollections> | null = null;
let activeWorkspaceCollections: WorkspaceCollections | null = null;

export function ensureWorkspaceCollections(
  workspaceId: string
): Promise<WorkspaceCollections> {
  if (workspaceId === activeWorkspaceId && activeWorkspacePromise !== null) {
    return activeWorkspacePromise;
  }

  activeWorkspaceId = workspaceId;
  activeWorkspaceCollections = null;
  activeWorkspacePromise = createWorkspaceCollections(workspaceId).then(
    (collections) => {
      activeWorkspaceCollections = collections;
      return collections;
    }
  );

  return activeWorkspacePromise;
}

export function getWorkspaceCollections(): WorkspaceCollections {
  if (activeWorkspaceCollections === null) {
    throw new Error("Workspace collections have not been initialized");
  }

  return activeWorkspaceCollections;
}
