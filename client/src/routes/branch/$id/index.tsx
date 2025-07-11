import { redirect, useParams } from "@tanstack/react-router";
import { isAuthenticated } from "../../../libs/authenticated";
import AppLayout from "../../../components/Layout";
import Header from "../../../components/Header";
import { useGetBranchById } from "../../../hooks/branch.hook";
import Card from "../../../components/Card";
import { useState } from "react";
import { View } from "../../../components/Pages/branch/view";
import { Coaches } from "../../../components/Pages/branch/coaches";
import { Edit } from "../../../components/Pages/branch/edit";
import { Members } from "../../../components/Pages/branch/members";
import { Schedules } from "../../../components/Pages/branch/schedules";
import { Examinations } from "../../../components/Pages/branch/examinations";
import { Loading } from "../../../components/Loading";

export const Route = createFileRoute({
  component: RouteComponent,
  beforeLoad: async () => {
    if (!isAuthenticated()) {
      throw redirect({ to: "/login" });
    }
  },
});

function RouteComponent() {
  // const navigate = useNavigate();
  const { id } = useParams({ from: "/branch/$id/" });
  const { data: branch, isFetching } = useGetBranchById(id);
  const [included, setIncluded] = useState<
    "view" | "edit" | "members" | "coaches" | "schedules" | "examinations"
  >("view");
  return (
    <AppLayout>
      <Header name={branch?.name} create={false} />
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
              included === "members" ? "btn-primary" : "btn-ghost"
            }`}
            onClick={() => setIncluded("members")}
          >
            Members
          </button>
          <button
            className={`btn btn-sm ${
              included === "coaches" ? "btn-primary" : "btn-ghost"
            }`}
            onClick={() => setIncluded("coaches")}
          >
            Coaches
          </button>
          <button
            className={`btn btn-sm ${
              included === "schedules" ? "btn-primary" : "btn-ghost"
            }`}
            onClick={() => setIncluded("schedules")}
          >
            Schedules
          </button>
          <button
            className={`btn btn-sm ${
              included === "examinations" ? "btn-primary" : "btn-ghost"
            }`}
            onClick={() => setIncluded("examinations")}
          >
            Examinations
          </button>
        </div>
      </Card>
      {isFetching ? (
        <Loading />
      ) : (
        <>
          {included === "view" ? <View branch={branch} /> : null}
          {included === "edit" ? <Edit branch={branch} /> : null}
          {included === "members" ? <Members branch={branch} /> : null}
          {included === "coaches" ? <Coaches branch={branch} /> : null}
          {included === "schedules" ? <Schedules branch={branch} /> : null}
          {included === "examinations" ? (
            <Examinations branch={branch} />
          ) : null}
        </>
      )}
    </AppLayout>
  );
}
