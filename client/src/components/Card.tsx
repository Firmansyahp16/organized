type Props = {
  children: React.ReactNode;
  compact?: boolean;
  expanded?: boolean;
};

export default function Card({ children, compact, expanded }: Props) {
  return (
    <div
      className={`card ${compact ? "card-xs" : ""} bg-base-100 w-full ${
        expanded ? "" : "max-w-96"
      }`}
    >
      <div className="card-body">{children}</div>
    </div>
  );
}
