type Props = {
  label: string;
  value: string | number | boolean | null;
  isDate?: boolean;
  isCurrency?: boolean;
};

export default function Display({ label, value, isDate, isCurrency }: Props) {
  return (
    <div className="flex flex-col">
      <span className="font-bold">{label}</span>
      {isDate ? (
        <span>
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
        <span>
          {new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
          }).format(Number(value))}
        </span>
      ) : (
        <span>{value}</span>
      )}
    </div>
  );
}
