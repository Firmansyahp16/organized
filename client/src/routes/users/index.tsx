import { redirect, useNavigate } from "@tanstack/react-router";
import { isAuthenticated } from "../../libs/authenticated";
import AppLayout from "../../components/Layout";
import Header from "../../components/Header";
import { createColumnHelper, PaginationState } from "@tanstack/react-table";
import { useGetAllUsers } from "../../hooks/user.hook";
import { useState } from "react";
import Card from "../../components/Card";
import { Table } from "../../components/Table";
import { RankBadge } from "../../components/RankBadge";

export const Route = createFileRoute({
  component: RouteComponent,
  beforeLoad: async () => {
    if (!isAuthenticated()) {
      return redirect({ to: "/login" });
    }
  },
});

function RouteComponent() {
  const navigate = useNavigate();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const helper = createColumnHelper<any>();
  const columsn = [
    helper.accessor("id", {
      header: "ID",
      cell: (info) => info.getValue(),
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
    helper.accessor("createdAt", {
      header: "Joined At",
      cell: (info) =>
        Intl.DateTimeFormat("id-ID", { dateStyle: "medium" })
          .format(new Date(info.getValue()))
          .toString(),
    }),
    helper.display({
      id: "action",
      header: "Action",
      cell: (info) => (
        <div className="join">
          <button
            className="join-item btn btn-outline btn-primary"
            onClick={() =>
              navigate({
                to: "/users/$id",
                params: { id: info.row.original.id },
              })
            }
          >
            View
          </button>
        </div>
      ),
    }),
  ];
  const { data: users } = useGetAllUsers(pagination);
  return (
    <AppLayout>
      <Header name="Users" create />
      <Card expanded>
        <Table
          columns={columsn}
          data={users ?? []}
          page={[pagination, setPagination]}
        />
      </Card>
    </AppLayout>
  );
}
