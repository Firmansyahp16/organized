import { useField, useForm } from "@tanstack/react-form";

type Props = {
  label: string;
  name: string;
  form: ReturnType<typeof useForm>;
  required?: boolean;
  options: { label: string; value: string }[];
  defaultValue?: string;
};

export default function OptionField({
  form,
  required,
  label,
  name,
  options,
  defaultValue,
}: Props) {
  if (!form.Field) {
    return;
  } else {
    if (defaultValue !== undefined) {
      useField({ form, name, defaultValue });
    }
    return (
      <form.Field
        name={name}
        validators={{
          onChange: required
            ? ({ value }) =>
                value === undefined || value === ""
                  ? `${label} is required`
                  : undefined
            : undefined,
        }}
        children={(field) => {
          const valid = field.state.meta.isValid;
          return (
            // <div className="form-control justify-end">
            <label className="label cursor-pointer grid grid-cols-1 gap-1 w-full">
              <span
                className={`label-text capitalize flex gap-1 ${
                  !valid ? "text-error" : ""
                }`}
              >
                {label} {required && <span className="text-error">*</span>}
              </span>
              <select
                className="select select-bordered"
                name={name}
                onChange={(e) => field.handleChange(e.target.value)}
              >
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            // </div>
          );
        }}
      />
    );
  }
}
