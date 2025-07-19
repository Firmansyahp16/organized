type Props = {
  label: string;
  value: string | number | boolean | null;
  isDate?: boolean;
  isCurrency?: boolean;
  capitalize?: boolean;
};

export default function Display({
  label,
  value,
  isDate,
  isCurrency,
  capitalize,
}: Props) {
  return (
    <div className="flex flex-col">
      <span className="font-bold">{label}</span>
      {isDate ? (
        <span className={capitalize ? "capitalize" : ""}>
          {`${new Intl.DateTimeFormat("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(
            Number.isNaN(new Date(String(value)).getTime())
              ? new Date()
              : new Date(String(value))
          )}`}
        </span>
      ) : isCurrency ? (
        <span className={capitalize ? "capitalize" : ""}>
          {new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
          }).format(Number(value))}
        </span>
      ) : (
        <span className={capitalize ? "capitalize" : ""}>{value}</span>
      )}
    </div>
  );
}
