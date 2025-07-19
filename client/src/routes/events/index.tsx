import { redirect, useNavigate } from "@tanstack/react-router";
import { createColumnHelper, PaginationState } from "@tanstack/react-table";
import { useState } from "react";
import Card from "../../components/Card";
import Header from "../../components/Header";
import AppLayout from "../../components/Layout";
import { Table } from "../../components/Table";
import { useDeleteEvent, useGetAllEvents } from "../../hooks/event.hook";
import { isAuthenticated } from "../../libs/authenticated";

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
  const { mutate: deleteEvent } = useDeleteEvent();
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
      cell: (info) => <span className="capitalize">{info.getValue()}</span>,
    }),
    helper.display({
      id: "actions",
      header: "Action",
      cell: (info) => (
        <div className="join">
          <button
            className="join-item btn btn-outline btn-primary"
            onClick={() =>
              navigate({
                to: "/events/$id",
                params: { id: info.row.original.id },
              })
            }
          >
            View
          </button>
          <button
            className="join-item btn btn-outline btn-error"
            onClick={() => deleteEvent(info.row.original.id)}
          >
            Delete
          </button>
        </div>
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
