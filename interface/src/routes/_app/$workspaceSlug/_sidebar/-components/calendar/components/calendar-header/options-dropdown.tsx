import { useAtomValue } from "@effect/atom-react";
import { Button } from "@recount/ui/button";
import { Icons } from "@recount/ui/icons";
import {
  Menu,
  MenuCheckboxItem,
  MenuPopup,
  MenuGroup,
  MenuTrigger,
  MenuSeparator,
  MenuSubTrigger,
  MenuSub,
  MenuSubPopup,
} from "@recount/ui/menu";

import { calendarDaysInViewAtom, setCalendarDaysInView } from "../../atoms";

function OptionsDropdown() {
  const daysInView = useAtomValue(calendarDaysInViewAtom);
  return (
    <Menu>
      <MenuTrigger
        render={(props) => (
          <Button size="icon" variant="ghost" {...props}>
            <Icons.DotsThreeHorizontal />
          </Button>
        )}
      />
      <MenuPopup>
        <MenuGroup>
          <MenuCheckboxItem
            checked={daysInView === 1}
            onCheckedChange={() => setCalendarDaysInView(1)}
          >
            Day view
          </MenuCheckboxItem>
          <MenuCheckboxItem
            checked={daysInView === 7}
            onCheckedChange={() => setCalendarDaysInView(7)}
          >
            Week view
          </MenuCheckboxItem>
        </MenuGroup>
        <MenuSeparator />
        <MenuSub>
          <MenuSubTrigger>Number of days</MenuSubTrigger>
          <MenuSubPopup>
            {[2, 3, 4, 5, 6].map((option) => (
              <MenuCheckboxItem
                checked={daysInView === option}
                key={option}
                onCheckedChange={() => setCalendarDaysInView(option)}
              >
                {option} days
              </MenuCheckboxItem>
            ))}
          </MenuSubPopup>
        </MenuSub>
      </MenuPopup>
    </Menu>
  );
}

export { OptionsDropdown };
