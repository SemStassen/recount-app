import type { Select as SelectPrimitive } from "@base-ui/react";
import { RichTextEditor } from "@recount/editor";
import type { RichTextContent } from "@recount/editor";
import { Button } from "@recount/ui/button";
import type { ButtonProps } from "@recount/ui/button";
import { Calendar } from "@recount/ui/calendar";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@recount/ui/field";
import type {
  FieldDescriptionProps,
  FieldErrorProps,
  FieldLabelProps,
  FieldProps,
} from "@recount/ui/field";
import { Icons } from "@recount/ui/icons";
import { Input } from "@recount/ui/input";
import type { InputProps } from "@recount/ui/input";
import { Popover, PopoverPopup, PopoverTrigger } from "@recount/ui/popover";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
  type SelectValueProps,
} from "@recount/ui/select";
import { Switch } from "@recount/ui/switch";
import type { SwitchProps } from "@recount/ui/switch";
import { Textarea } from "@recount/ui/textarea";
import type { TextareaProps } from "@recount/ui/textarea";
import { TimePicker, type TimePickerProps } from "@recount/ui/time-picker";
import { cn } from "@recount/ui/utils";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { cva } from "class-variance-authority";
import type { PropsWithChildren } from "react";

import { useDateTimeFormatter } from "~/lib/utils/date-time";

const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

export const { useAppForm, withFieldGroup } = createFormHook({
  fieldComponents: {
    CustomField,
    TextField,
    TextareaField,
    SwitchField,
    DatePickerField,
    TimePickerField,
    SelectField,
    EditorField,
  },
  formComponents: {
    SubmitButton,
  },
  fieldContext,
  formContext,
});

const baseFieldVariants = cva("flex-1", {
  variants: {
    direction: {
      vertical: "flex-col",
      horizontal: "flex-row justify-between gap-2",
    },
  },
});

export interface BaseFieldProps extends PropsWithChildren {
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
  const fieldCtx = useFieldContext();

  const errorMessage = fieldCtx.state.meta.errors[0]?.message;
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
            <FieldError {...error}>{errorMessage}</FieldError>
          </div>
        </>
      )}
      {direction === "vertical" && (
        <>
          <FieldLabel {...label} />
          {description && <FieldDescription {...description} />}
          {children}
          <FieldError {...error}>{errorMessage}</FieldError>
        </>
      )}
    </Field>
  );
}

export interface CustomFieldProps extends BaseFieldProps {}
function CustomField(props: CustomFieldProps) {
  return <BaseField {...props} />;
}

export interface TextFieldProps extends BaseFieldProps {
  input?: InputProps;
}
function TextField({ input, ...props }: TextFieldProps) {
  const fieldCtx = useFieldContext<string>();

  return (
    <BaseField {...props}>
      <Input
        onBlur={fieldCtx.handleBlur}
        value={fieldCtx.state.value}
        onValueChange={fieldCtx.handleChange}
        {...input}
        type="text"
      />
    </BaseField>
  );
}

export interface TextareaFieldProps extends BaseFieldProps {
  textarea?: TextareaProps;
}
function TextareaField({ textarea, ...props }: TextareaFieldProps) {
  const fieldCtx = useFieldContext<string>();

  return (
    <BaseField {...props}>
      <Textarea
        onBlur={fieldCtx.handleBlur}
        value={fieldCtx.state.value}
        onChange={(e) => fieldCtx.handleChange(e.target.value)}
        {...textarea}
      />
    </BaseField>
  );
}
export interface SwitchFieldProps extends BaseFieldProps {
  switch?: SwitchProps;
}
function SwitchField({ switch: switchProps, ...props }: SwitchFieldProps) {
  const fieldCtx = useFieldContext<boolean>();

  return (
    <BaseField {...props}>
      <Switch
        checked={fieldCtx.state.value}
        onCheckedChange={fieldCtx.handleChange}
        {...switchProps}
      />
    </BaseField>
  );
}

interface SelectFieldItem<Value> {
  label: React.ReactNode;
  value: Value;
}

export interface SelectFieldProps<
  Value,
  Multiple extends boolean,
> extends BaseFieldProps {
  select: Omit<
    SelectPrimitive.Root.Props<Value, Multiple>,
    "multiple" | "items"
  > & {
    items: Array<SelectFieldItem<Value>>;
  };
  selectValue?: SelectValueProps;
}

function SelectField<Value>({
  select,
  selectValue,
  ...props
}: SelectFieldProps<Value, false>) {
  const fieldCtx = useFieldContext<Value | undefined>();

  return (
    <BaseField {...props}>
      <Select
        value={fieldCtx.state.value}
        onValueChange={(value) => fieldCtx.handleChange(value ?? undefined)}
        {...select}
      >
        <SelectTrigger>
          <SelectValue {...selectValue} />
        </SelectTrigger>
        <SelectPopup>
          {select.items.map(({ label, value }) => (
            <SelectItem key={String(value)} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectPopup>
      </Select>
    </BaseField>
  );
}

export interface DatePickerFieldProps extends BaseFieldProps {}
function DatePickerField({ ...props }: DatePickerFieldProps) {
  const fieldCtx = useFieldContext<Date | null>();
  const formatter = useDateTimeFormatter();

  return (
    <BaseField {...props}>
      <Popover>
        <PopoverTrigger
          render={
            <Button variant="outline" className="w-full justify-start">
              <Icons.Calendar />
              {fieldCtx.state.value
                ? formatter.date(fieldCtx.state.value)
                : "Select date"}
            </Button>
          }
        />
        <PopoverPopup align="start">
          <Calendar
            mode="single"
            selected={fieldCtx.state.value ?? undefined}
            onSelect={(date) => fieldCtx.handleChange(date ?? null)}
          />
        </PopoverPopup>
      </Popover>
    </BaseField>
  );
}

export interface TimePickerFieldProps extends BaseFieldProps {
  timePicker?: Omit<
    TimePickerProps,
    "format" | "locale" | "onChange" | "value"
  >;
}
function TimePickerField({ timePicker, ...props }: TimePickerFieldProps) {
  const fieldCtx = useFieldContext<Date | null>();
  const formatter = useDateTimeFormatter();

  return (
    <BaseField {...props}>
      <TimePicker
        format={formatter.time}
        locale="en"
        onChange={fieldCtx.handleChange}
        value={fieldCtx.state.value}
        {...timePicker}
      />
    </BaseField>
  );
}

export interface EditorFieldProps extends BaseFieldProps {}
function EditorField(props: EditorFieldProps) {
  const fieldCtx = useFieldContext<RichTextContent>();

  return (
    <BaseField {...props}>
      <RichTextEditor
        content={fieldCtx.state.value}
        onChange={fieldCtx.handleChange}
      />
    </BaseField>
  );
}

export interface SubmitButtonProps extends ButtonProps {}
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
