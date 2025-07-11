import { Link } from "@tanstack/react-router";

type Props = {
  name: string;
  create?: boolean;
  endpoint?: string;
};

export default function Header({ name, create, endpoint }: Props) {
  return (
    <div className="flex bg-base-100 p-5 items-end gap-5 rounded-lg">
      <h1 className="text-2xl capitalize font-bold">{name}</h1>
      {create && (
        <Link
          to={endpoint || ""}
          className="btn btn-primary btn-ghost btn-sm btn-outline"
        >
          New
        </Link>
      )}
    </div>
  );
}
