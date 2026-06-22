import { Button } from "@recount/ui/button";
import { Icons } from "@recount/ui/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@recount/ui/popover";
import { Separator } from "@recount/ui/separator";
import { useState } from "react";
import { HexColorPicker } from "react-colorful";

import styles from "./color-picker.module.css";

const colors = [
  {
    hexColor: "#bec2c8",
    label: "Grey",
  },
  {
    hexColor: "#95a2b3",
    label: "Dark grey",
  },
  {
    hexColor: "#5e6ad2",
    label: "Purple",
  },
  {
    hexColor: "#26b5ce",
    label: "Teal",
  },
  {
    hexColor: "#4cb782",
    label: "Green",
  },
  {
    hexColor: "#f0bf00",
    label: "Yellow",
  },
  {
    hexColor: "#f2994a",
    label: "Orange",
  },
  {
    hexColor: "#f7c8c1",
    label: "Pink",
  },
  {
    hexColor: "#eb5757",
    label: "Red",
  },
];

interface ColorPickerProps {
  value: string | null;
  onValueChange: (value: string | null) => void;
}

export function ColorPicker({ value, onValueChange }: ColorPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button aria-label="Choose color" size="icon" variant="outline">
            <span
              aria-hidden="true"
              className="size-4.5 rounded-full border border-black/10"
              style={{ backgroundColor: value ?? "transparent" }}
            />
          </Button>
        }
      />
      <PopoverContent align="start">
        <div className="flex flex-col gap-2">
          <div className="flex flex-row gap-2" aria-label="Colors">
            {colors.map((color) => {
              const isSelected = color.hexColor === value;

              return (
                <button
                  key={color.hexColor}
                  aria-label={color.label}
                  className="flex size-7 items-center justify-center rounded-full outline-none ring-offset-background transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  onClick={() => {
                    onValueChange(color.hexColor);
                    setOpen(false);
                  }}
                  style={{
                    backgroundColor: color.hexColor,
                  }}
                  type="button"
                >
                  {isSelected && <Icons.Check />}
                </button>
              );
            })}
          </div>
          <Separator orientation="horizontal" />
          <div className={styles.root}>
            <HexColorPicker
              color={value ?? undefined}
              onChange={onValueChange}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
