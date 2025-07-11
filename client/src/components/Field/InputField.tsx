import { useField, useForm } from "@tanstack/react-form";

type Props = {
  form: ReturnType<typeof useForm>;
  required?: boolean;
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
  step?: number;
  max?: number | string;
  min?: number | string;
  defaultValue?: any;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function InputField({
  form,
  required,
  label,
  name,
  min,
  placeholder,
  type,
  step,
  max,
  defaultValue,
}: Props) {
  function toLocalDateTimeString(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
  useField({
    form,
    name,
    defaultValue,
  });
  return (
    <form.Field
      name={name}
      validators={{
        onChange: required
          ? ({ value }) =>
              value === undefined || value === "" ? `is required` : undefined
          : undefined,
      }}
      children={(field) => {
        const formattedValue =
          type === "datetime-local" && field.state.value
            ? toLocalDateTimeString(new Date(field.state.value as string))
            : type === "date" && field.state.value
            ? new Date(field.state.value as string).toISOString().split("T")[0]
            : String(field.state.value ?? "");

        const valid = field.state.meta.isValid;
        const touched = field.state.meta.isTouched;

        return (
          <label className="form-control w-full grid grid-cols-1 gap-1 content-start">
            <div className="label flex gap-1">
              <span className="label-text">{label}</span>
              <div className="label">
                <span className="label-text-alt text-error">
                  {touched && !valid
                    ? field.state.meta.errors.join(", ")
                    : required && "*"}
                </span>
              </div>
            </div>
            {type === "textarea" ? (
              <textarea
                value={formattedValue}
                onChange={(e) => {
                  field.handleChange(e.target.value);
                }}
                onBlur={field.handleBlur}
                placeholder={placeholder}
                className={`textarea textarea-bordered w-full h-24 ${
                  touched && !valid ? "textarea-error" : ""
                }`}
              />
            ) : (
              <input
                type={type}
                step={step}
                min={min}
                max={max}
                value={formattedValue}
                onChange={(e) => {
                  field.handleChange(e.target.value);
                }}
                onBlur={field.handleBlur}
                placeholder={placeholder}
                className={`input input-bordered w-full ${
                  touched && !valid ? "input-error" : ""
                }`}
              />
            )}
          </label>
        );
      }}
    />
  );
}
