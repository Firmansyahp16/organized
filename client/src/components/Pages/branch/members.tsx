import { Link } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { RankBadge } from "../../RankBadge";
import Card from "../../Card";
import { Table } from "../../Table";

export function Members({ branch }: { branch: Record<string, any> }) {
  const helper = createColumnHelper<any>();
  const column = [
    helper.accessor("id", {
      header: "ID",
      cell: (info) => (
        <Link
          to="/users/$id"
          className="hover:link"
          params={{ id: info.getValue() }}
        >
          {info.getValue()}
        </Link>
      ),
    }),
    helper.accessor("fullName", {
      header: "Name",
      cell: (info) => info.getValue(),
    }),
    helper.accessor("email", {
      header: "Email",
      cell: (info) => info.getValue(),
    }),
    helper.accessor("rank", {
      header: "Rank",
      cell: (info) => <RankBadge rank={info.getValue()} />,
    }),
  ];
  return (
    <Card expanded>
      <h1 className="card-title">Members</h1>
      <Table columns={column} data={branch?.members ?? []} />
    </Card>
  );
}
