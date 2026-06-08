import { useState } from "react";

import {
  Combobox,
  ComboboxPopup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "./combobox.coss";
import { InputTime } from './input-time';
import type { InputTimeProps } from './input-time';

export interface TimePickerProps extends InputTimeProps {
  step?: 5 | 10 | 15 | 20 | 30;
}

type Item = Date;

const TimePicker = ({
  format,
  locale,
  step = 15,
  value,
  onChange,
  defaultValue,
  ...props
}: TimePickerProps) => {
  const [internalValue, setInternalValue] = useState<Date | null>(
    defaultValue ?? null
  );

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;
  const referenceValue = currentValue ?? new Date();

  function setValue(next: Date | null) {
    if (!isControlled) {
      setInternalValue(next);
    }
    onChange?.(next);
  }

  const totalSteps = (24 * 60) / step;

  const items: Array<Date> = Array.from({ length: totalSteps }, (_, i) => {
    const minutes = i * step;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    const d = new Date(referenceValue);
    d.setHours(hours, mins, 0, 0);
    return d;
  });

  function handleValueChange(selected: unknown) {
    if (typeof selected === "string") {
      const parsed = new Date(selected);
      if (!Number.isNaN(parsed.getTime())) {
        setValue(parsed);
      }
    }
  }

  return (
    <Combobox
      // Disable filtering
      filter={() => true}
      items={items}
      onValueChange={handleValueChange}
      value={currentValue?.toISOString() ?? ""}
    >
      <ComboboxInput
        render={(inputProps) => {
          const { defaultValue: _defaultValue, ...inputTimeProps } = inputProps;

          return (
            <InputTime
              {...inputTimeProps}
              format={format}
              locale={locale}
              onBlur={props.onBlur}
              onChange={setValue}
              value={currentValue}
            />
          );
        }}
      />
      <ComboboxPopup>
        <ComboboxList>
          {(item: Item) => (
            <ComboboxItem key={item.toISOString()} value={item.toISOString()}>
              {format(item)}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxPopup>
    </Combobox>
  );
};

export { TimePicker };
