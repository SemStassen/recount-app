import { useAtom } from "@effect/atom-react";
import { Button } from "@recount/ui/button";
import { Icons } from "@recount/ui/icons";
import { AnimatePresence, motion } from "motion/react";

import { projectSidebarAtom } from "~/atoms/ui-atoms";

import { CreateProjectForm } from "./create-project-form";

const SIDEBAR_WIDTH = 450;

export function ProjectSidebar() {
  const [projectSidebar, setProjectSidebar] = useAtom(projectSidebarAtom);

  return (
    <AnimatePresence initial={false}>
      {projectSidebar && (
        <motion.aside
          animate={{ width: SIDEBAR_WIDTH }}
          className="h-full border-l"
          exit={{ width: 0 }}
          initial={{ width: 0 }}
          transition={{
            ease: "linear",
            duration: 0.1,
          }}
        >
          <div
            className="flex h-full flex-col px-4 pt-3 pb-4"
            style={{
              width: SIDEBAR_WIDTH,
            }}
          >
            <header className="flex flex-row justify-end">
              <Button
                onClick={() => setProjectSidebar(null)}
                size="icon"
                variant="ghost"
              >
                <Icons.X size={16} />
              </Button>
            </header>
            {projectSidebar.mode === "create" && <CreateProjectForm />}
            {projectSidebar.mode === "edit" && (
              <div>
                <div>{projectSidebar.projectId}</div>
                <CreateProjectForm />
              </div>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
