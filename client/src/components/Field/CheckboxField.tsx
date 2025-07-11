import type { useForm } from "@tanstack/react-form";

type Props = {
  label: string;
  name: string;
  form: ReturnType<typeof useForm>;
  required?: boolean;
  defaultValue?: boolean;
  options?: { label: string; value: boolean }[];
};

export default function CheckboxField({
  form,
  required,
  label,
  name,
  options,
  defaultValue = false,
}: Props) {
  return (
    <form.Field
      name={name}
      defaultValue={defaultValue}
      validators={{
        onChange: required
          ? ({ value }) =>
              value !== true ? "This field is required" : undefined
          : undefined,
      }}
      children={(field) => {
        const valid = field.state.meta.isValid;
        const touched = field.state.meta.isTouched;
        const errors = field.state.meta.errors;
        const checked = !!field.state.value;

        // Tentukan label dari options
        const labelForValue =
          options?.find((opt) => opt.value === checked)?.label ??
          (checked ? "Yes" : "No");

        return (
          <div className="form-control grid gap-1">
            <label className="label">
              <span
                className={`label-text capitalize flex ${
                  !valid && touched ? "text-error" : ""
                }`}
              >
                {label}
                {required && <span className="text-error">*</span>}
              </span>
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="checkbox"
                name={name}
                className="checkbox h-10 w-10"
                checked={checked}
                onChange={(e) => field.handleChange(e.target.checked)}
              />
              <span className="label-text">{labelForValue}</span>
            </div>
            {touched && !valid && (
              <span className="text-sm text-error">{errors.join(", ")}</span>
            )}
          </div>
        );
      }}
    />
  );
}
