import Card from "../../Card";
import Display from "../../Display";

type Props = {
  branch: Record<string, any>;
};

export function View({ branch }: Props) {
  return (
    <Card expanded>
      <h1 className="card-title">Details</h1>
      <div className="grid grid-cols-2 gap-5">
        <Display label="Name" value={branch?.name} />
        <Display label="Created At" value={branch?.createdAt} isDate />
      </div>
    </Card>
  );
}
