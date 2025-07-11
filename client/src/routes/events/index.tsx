import { redirect, useNavigate } from "@tanstack/react-router";
import { isAuthenticated } from "../../libs/authenticated";
import AppLayout from "../../components/Layout";
import Header from "../../components/Header";
import { useGetAllEvents } from "../../hooks/event.hook";
import { useState } from "react";
import { createColumnHelper, PaginationState } from "@tanstack/react-table";
import Card from "../../components/Card";
import { Table } from "../../components/Table";

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
    pageSize: 10,
  });
  const { data: events } = useGetAllEvents(pagination);
  const helper = createColumnHelper<any>();
  const columns = [
    helper.accessor("id", {
      header: "ID",
      cell: (info) => info.getValue(),
    }),
    helper.accessor("title", {
      header: "Title",
      cell: (info) => info.getValue(),
    }),
    helper.accessor("date", {
      header: "Date",
      cell: (info) =>
        Intl.DateTimeFormat("id-ID", { dateStyle: "medium" })
          .format(new Date(info.getValue()))
          .toString(),
    }),
    helper.accessor("type", {
      header: "Type",
      cell: (info) => info.getValue(),
    }),
    helper.display({
      id: "actions",
      header: "Action",
      cell: (info) => (
        <button
          className="btn btn-primary"
          onClick={() =>
            navigate({
              to: `/events/$id`,
              params: { id: info.row.original.id },
            })
          }
        >
          View
        </button>
      ),
    }),
  ];
  return (
    <AppLayout>
      <Header name="Events" create endpoint="/events/new" />
      <Card expanded>
        <Table
          columns={columns}
          data={events ?? []}
          page={[pagination, setPagination]}
        />
      </Card>
    </AppLayout>
  );
}
