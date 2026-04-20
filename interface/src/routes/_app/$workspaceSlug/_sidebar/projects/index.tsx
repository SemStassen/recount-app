import { createFileRoute } from "@tanstack/react-router";

import { Header } from "../-components/header";
import { ProjectSidebar } from "./-components/project-sidebar";
import { ProjectsList } from "./-components/projects-list";

export const Route = createFileRoute("/_app/$workspaceSlug/_sidebar/projects/")(
  {
    component: RouteComponent,
  }
);

function RouteComponent() {
  return (
    <div className="flex flex-row w-full h-full">
      <div className="flex flex-col w-full">
        <Header />
        <ProjectsList />
      </div>
      <ProjectSidebar />
    </div>
  );
}
