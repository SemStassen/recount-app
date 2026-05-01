import { useAtomValue } from "@effect/atom-react";
import { AnimatePresence, motion } from "motion/react";

import { calendarIsCreateSidebarOpenAtom } from "../atoms";
import { CreateTimeEntryForm } from "./create-time-entry-form";

const SIDEBAR_WIDTH = 400;

function RightSidebar() {
  const isOpen = useAtomValue(calendarIsCreateSidebarOpenAtom);

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.aside
          animate={{ width: SIDEBAR_WIDTH }}
          className="h-full overflow-hidden border-l"
          exit={{ width: 0 }}
          initial={{ width: 0 }}
          transition={{
            ease: "linear",
            duration: 0.1,
          }}
        >
          <div
            className="mt-8 flex h-full flex-col justify-between px-4 pt-3 pb-4"
            style={{
              width: SIDEBAR_WIDTH,
            }}
          >
            <CreateTimeEntryForm />
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

export { RightSidebar };
