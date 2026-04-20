import type { SelectItemProps } from "@base-ui/react";
import { RichTextEditor } from "@recount/editor";
import type { RichTextContent } from "@recount/editor";
import { Button } from "@recount/ui/button";
import type { ButtonProps } from "@recount/ui/button";
import { Calendar } from "@recount/ui/calendar";
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
import { Popover, PopoverPopup, PopoverTrigger } from "@recount/ui/popover";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@recount/ui/select";
import { Switch } from "@recount/ui/switch";
import type { SwitchProps } from "@recount/ui/switch";
import { Textarea } from "@recount/ui/textarea";
import type { TextareaProps } from "@recount/ui/textarea";
import { cn } from "@recount/ui/utils";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { cva } from "class-variance-authority";
import type { PropsWithChildren } from "react";

import { useDateTimeFormatter } from "~/lib/utils/date-time";

const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

export const { useAppForm } = createFormHook({
  fieldComponents: {
    CustomField,
    TextField,
    TextareaField,
    SwitchField,
    DateField,
    // TimeField: TimeField,
    SelectField,
    // ComboBoxField: ComboBoxField,
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

interface CustomFieldProps extends BaseFieldProps {
  control?: FieldControlProps;
}
function CustomField({ control, ...props }: CustomFieldProps) {
  return (
    <BaseField {...props}>
      <FieldControl {...control} />
    </BaseField>
  );
}

interface TextFieldProps extends BaseFieldProps {
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

interface TextareaFieldProps extends BaseFieldProps {
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
interface SwitchFieldProps extends BaseFieldProps {
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

interface SelectFieldProps extends BaseFieldProps {
  items: Array<SelectItemProps>;
}
function SelectField({ items, ...props }: SelectFieldProps) {
  const fieldCtx = useFieldContext<string | undefined>();

  return (
    <BaseField {...props}>
      <Select
        value={fieldCtx.state.value}
        onValueChange={(value) => fieldCtx.handleChange(value ?? undefined)}
      >
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
  const fieldCtx = useFieldContext<Date | undefined>();
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
            selected={fieldCtx.state.value}
            onSelect={fieldCtx.handleChange}
          />
        </PopoverPopup>
      </Popover>
    </BaseField>
  );
}

interface EditorFieldProps extends BaseFieldProps {}
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
