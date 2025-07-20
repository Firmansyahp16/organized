import { redirect, useParams } from "@tanstack/react-router";
import { useState } from "react";
import Card from "../../../components/Card";
import Header from "../../../components/Header";
import AppLayout from "../../../components/Layout";
import { Loading } from "../../../components/Loading";
import { Details } from "../../../components/Pages/event/details";
import { View } from "../../../components/Pages/event/view";
import { useGetEventById } from "../../../hooks/event.hook";
import { isAuthenticated } from "../../../libs/authenticated";

export const Route = createFileRoute({
  component: RouteComponent,
  beforeLoad: async () => {
    if (!isAuthenticated()) {
      return redirect({ to: "/login" });
    }
  },
});

function RouteComponent() {
  const { id } = useParams({ from: "/events/$id/" });
  const { data: event, isFetching } = useGetEventById(id);
  const [included, setIncluded] = useState("view");
  return (
    <AppLayout>
      <Header name={`${event?.title} - ${event?.id}`} />
      <Card expanded compact>
        <div className="flex gap-2">
          <button
            className={`btn btn-sm ${
              included === "view" ? "btn-primary" : "btn-ghost"
            }`}
            onClick={() => setIncluded("view")}
          >
            View
          </button>
          <button
            className={`btn btn-sm ${
              included === "edit" ? "btn-primary" : "btn-ghost"
            }`}
            onClick={() => setIncluded("edit")}
          >
            Edit
          </button>
          <button
            className={`btn btn-sm ${
              included === "details" ? "btn-primary" : "btn-ghost"
            }`}
            onClick={() => {
              setIncluded("details");
            }}
          >
            Details
          </button>
        </div>
      </Card>
      {isFetching ? (
        <Loading />
      ) : (
        <>
          {included === "view" ? <View event={event} /> : null}
          {included === "details" ? <Details event={event} /> : null}
        </>
      )}
    </AppLayout>
  );
}
