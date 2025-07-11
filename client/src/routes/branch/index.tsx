import { redirect, useNavigate } from "@tanstack/react-router";
import { isAuthenticated } from "../../libs/authenticated";
import AppLayout from "../../components/Layout";
import Header from "../../components/Header";
import { Table } from "../../components/Table";
import { createColumnHelper, PaginationState } from "@tanstack/react-table";
import { useDeleteBranch, useGetAllBranches } from "../../hooks/branch.hook";
import { useState } from "react";
import Card from "../../components/Card";

export const Route = createFileRoute({
  component: RouteComponent,
  beforeLoad: async () => {
    if (!isAuthenticated()) {
      throw redirect({ to: "/login" });
    }
  },
});

function RouteComponent() {
  const navigate = useNavigate();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 15,
  });
  const { data: branches } = useGetAllBranches(pagination);
  const { mutate: deleteBranch } = useDeleteBranch();
  const helper = createColumnHelper<any>();
  const columns = [
    helper.accessor("id", {
      header: "ID",
      cell: (info) => info.getValue(),
    }),
    helper.accessor("name", {
      header: "Name",
      cell: (info) => info.getValue(),
    }),
    helper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => {
        return (
          <div className="join">
            <button
              className="join-item btn btn-outline btn-primary"
              onClick={() =>
                navigate({
                  to: "/branch/$id",
                  params: { id: info.row.original.id },
                })
              }
            >
              View
            </button>
            <button
              className="join-item btn btn-outline btn-error"
              onClick={() => deleteBranch(info.row.original.id)}
            >
              Delete
            </button>
          </div>
        );
      },
    }),
  ];
  return (
    <AppLayout>
      <Header name="Branches" create={true} endpoint="/branch/new" />
      <Card expanded>
        <Table
          columns={columns}
          data={branches || []}
          page={[pagination, setPagination]}
          count={branches?.length || 0}
        />
      </Card>
    </AppLayout>
  );
}
