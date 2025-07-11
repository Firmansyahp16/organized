import { redirect } from "@tanstack/react-router";
import { isAuthenticated } from "../libs/authenticated";
import AppLayout from "../components/Layout";
import Header from "../components/Header";
import { useGetDashboard } from "../hooks/dashboard.hook";
import Card from "../components/Card";

export const Route = createFileRoute({
  component: Index,
  beforeLoad: async () => {
    if (!isAuthenticated()) {
      throw redirect({ to: "/login" });
    }
  },
});

function Index() {
  const { data: dashboard } = useGetDashboard();
  return (
    <AppLayout>
      <Header name="Dashboard" create={false} />
      <div className="grid grid-cols-3 gap-3">
        <Card expanded>
          <h1 className="card-title">Active Members</h1>
          <p className="capitalize">{dashboard?.totalMembers} members</p>
        </Card>
        <Card expanded>
          <h1 className="card-title">Active Branches</h1>
          <p className="capitalize">{dashboard?.totalBranches} branches</p>
        </Card>
        <Card expanded>
          <h1 className="card-title">Active Coaches</h1>
          <p className="capitalize">{dashboard?.totalCoaches} coaches</p>
        </Card>
        <Card expanded>
          <h1 className="card-title">Upcoming Schedules</h1>
          <p className="capitalize">
            {dashboard?.todaySchedules?.length} schedules
          </p>
        </Card>
        <Card expanded>
          <h1 className="card-title">Upcoming Examinations</h1>
          <p className="capitalize">
            {dashboard?.nextExaminations?.length} examinations
          </p>
        </Card>
        <Card expanded>
          <h1 className="card-title">Upcoming Events</h1>
          <p className="capitalize">{dashboard?.nextEvents?.length} events</p>
        </Card>
      </div>
    </AppLayout>
  );
}
