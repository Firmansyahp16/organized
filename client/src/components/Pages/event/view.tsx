import { Link } from "@tanstack/react-router";
import Card from "../../Card";
import Display from "../../Display";

type Props = {
  event: Record<string, any>;
};

export function View({ event }: Props) {
  return (
    <Card expanded>
      <h1 className="card-title">Details</h1>
      <div className="grid grid-cols-2 gap-5">
        <Display label="Title" value={event?.title} />
        <Display label="Created At" value={event?.createdAt} isDate />
        <Display label="Type" value={event?.type} capitalize />
        <Display label="Description" value={event?.description} />
        <div>
          <p className="font-bold">Branches</p>
          {event?.branchIds.map((branchId: string) => (
            <Link
              className="hover:underline"
              to="/branch/$id"
              params={{ id: branchId }}
              key={branchId}
            >
              {branchId}
            </Link>
          ))}
        </div>
      </div>
    </Card>
  );
}
