import type { SelectItemProps } from "@base-ui/react";
import { Button } from "@recount/ui/button";
import type { ButtonProps } from "@recount/ui/button";
import { Calendar } from "@recount/ui/calendar";
import {
  Combobox,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
} from "@recount/ui/combobox";
import {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@recount/ui/field";
import type {
  FieldControlProps,
  FieldDescriptionProps,
  FieldErrorProps,
  FieldLabelProps,
  FieldProps,
} from "@recount/ui/field";
import { Icons } from "@recount/ui/icons";
import { Input } from "@recount/ui/input";
import type { InputProps } from "@recount/ui/input";
import { InputTime } from "@recount/ui/input-time";
import type { InputTimeProps } from "@recount/ui/input-time";
import { Popover, PopoverPopup, PopoverTrigger } from "@recount/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@recount/ui/select";
import { Textarea } from "@recount/ui/textarea";
import type { TextareaProps } from "@recount/ui/textarea";
import type { TimePickerProps } from "@recount/ui/time-picker";
import { cn } from "@recount/ui/utils";
import {
  createFormHook,
  createFormHookContexts,
  useStore,
} from "@tanstack/react-form";
import { cva, type VariantProps } from "class-variance-authority";
import type { PropsWithChildren } from "react";
import type React from "react";

import { formatter } from "~/lib/utils/date-time";

const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

export const { useAppForm } = createFormHook({
  fieldComponents: {
    CustomField: CustomField,
    TextField: TextField,
    TextareaField: TextareaField,
    DateField: DateField,
    // TimeField: TimeField,
    SelectField: SelectField,
    // ComboBoxField: ComboBoxField,
  },
  formComponents: {
    SubmitButton: SubmitButton,
  },
  fieldContext,
  formContext,
});

const baseFieldVariants = cva("", {
  variants: {
    direction: {
      vertical: "flex-col",
      horizontal: "flex-row",
    },
  },
});

interface BaseFieldProps extends PropsWithChildren {
  direction: "vertical" | "horizontal";
  label: FieldLabelProps;
  field?: FieldProps;
  description?: FieldDescriptionProps;
  error?: FieldErrorProps;
}

function BaseField({
  label,
  field,
  description,
  error,
  children,
  direction,
}: BaseFieldProps) {
  const { className, ...fieldProps } = field ?? {};

  return (
    <Field
      className={cn(baseFieldVariants({ direction, className }))}
      {...fieldProps}
    >
      {direction === "horizontal" && (
        <>
          <div>
            <FieldLabel {...label} />
            {description && <FieldDescription {...description} />}
          </div>
          <div>
            {children}
            <FieldError {...error} />
          </div>
        </>
      )}
      {direction === "vertical" && (
        <>
          <FieldLabel {...label} />
          {description && <FieldDescription {...description} />}
          {children}
          <FieldError {...error} />
        </>
      )}
    </Field>
  );
}

interface CustomFieldProps extends BaseFieldProps {
  control: FieldControlProps;
}
function CustomField({ control, ...props }: CustomFieldProps) {
  return (
    <BaseField {...props}>
      <FieldControl {...control} />
    </BaseField>
  );
}

interface InputFieldProps extends BaseFieldProps {
  input?: InputProps;
}
function TextField({ input, ...props }: InputFieldProps) {
  // const fieldContext = useFieldContext<string>();

  return (
    <BaseField {...props}>
      <Input
        // onBlur={fieldContext.handleBlur}
        // value={fieldContext.state.value}
        // onValueChange={fieldContext.handleChange}
        {...input}
        type="text"
      />
    </BaseField>
  );
}

interface TextareaFieldProps extends BaseFieldProps {
  textarea?: TextareaProps;
}
function TextareaField({ textarea, ...props }: TextareaFieldProps) {
  // const fieldContext = useFieldContext<string>();

  return (
    <BaseField {...props}>
      <Textarea
        // onBlur={fieldContext.handleBlur}
        // value={fieldContext.state.value}
        // onChange={(e) => fieldContext.handleChange(e.target.value)}
        {...textarea}
      />
    </BaseField>
  );
}

interface SelectFieldProps extends BaseFieldProps {
  items: Array<SelectItemProps>;
}
function SelectField({ items, ...props }: SelectFieldProps) {
  return (
    <BaseField {...props}>
      <Select>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectPopup>
          {items.map(({ label, value }) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectPopup>
      </Select>
    </BaseField>
  );
}

function DateField({ ...props }: BaseFieldProps) {
  return (
    <BaseField {...props}>
      <Popover>
        <PopoverTrigger
          render={
            <Button variant="outline">
              <Icons.Calendar />
            </Button>
          }
        />
        <PopoverPopup align="start">
          <Calendar mode="single" />
        </PopoverPopup>
      </Popover>
    </BaseField>
  );
}

interface SubmitButtonProps extends ButtonProps {}
function SubmitButton({ ...props }: SubmitButtonProps) {
  const form = useFormContext();
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button type="submit" disabled={isSubmitting} {...props} />
      )}
    </form.Subscribe>
  );
}
