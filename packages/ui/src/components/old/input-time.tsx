import { useEffect, useState } from "react";

import { chronoParse } from "#utils/chrono";
import type { ChronoLocale } from "#utils/chrono";

import { Input } from "../input";
import type { InputProps } from "../input";

export interface InputTimeProps extends Omit<
  InputProps,
  "value" | "onChange" | "defaultValue"
> {
  format: (date: Date) => string;
  locale: ChronoLocale;
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (value: Date | null) => void;
}

function InputTime({
  value,
  defaultValue,
  onChange,
  format,
  locale,
  ...props
}: InputTimeProps) {
  const [internalValue, setInternalValue] = useState<Date | null>(
    defaultValue ?? null
  );

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const [text, setText] = useState(currentValue ? format(currentValue) : "");

  useEffect(() => {
    setText(currentValue ? format(currentValue) : "");
  }, [currentValue, format]);

  function setValue(nextValue: Date | null) {
    if (!isControlled) {
      setInternalValue(nextValue);
    }
    onChange?.(nextValue);
  }

  function commit() {
    const raw = text.trim();

    if (!raw) {
      setValue(null);
      return;
    }

    const parsed = chronoParse({
      text: raw,
      ref: currentValue ?? new Date(),
      locale,
    });

    if (!parsed) {
      return;
    }

    setValue(parsed);
    setText(format(parsed));
  }

  return (
    <Input
      {...props}
      autoComplete="off"
      onBlur={commit}
      onChange={(e) => setText(e.target.value)}
      spellCheck={false}
      type="text"
      value={text}
    />
  );
}

export { InputTime };
