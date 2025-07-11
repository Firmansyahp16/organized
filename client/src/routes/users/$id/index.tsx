import { Link, redirect, useParams } from "@tanstack/react-router";
import { isAuthenticated } from "../../../libs/authenticated";
import { useGetUserById } from "../../../hooks/user.hook";
import AppLayout from "../../../components/Layout";
import Header from "../../../components/Header";
import Card from "../../../components/Card";
import Display from "../../../components/Display";
import { RankBadge } from "../../../components/RankBadge";

export const Route = createFileRoute({
  component: RouteComponent,
  beforeLoad: async () => {
    if (!isAuthenticated()) {
      throw redirect({ to: "/login" });
    }
  },
});

function RouteComponent() {
  const { id } = useParams({ from: "/users/$id/" });
  const { data: user } = useGetUserById(id);
  return (
    <AppLayout>
      <Header name={user?.fullName} />
      <Card expanded>
        <h1 className="card-title">Details</h1>
        <div className="grid grid-cols-2 gap-5">
          <Display label="Name" value={user?.fullName} />
          <Display label="Email" value={user?.email} />
          <div>
            <p className="font-bold">Rank</p>
            <RankBadge rank={user?.rank} />
          </div>
        </div>
      </Card>
      <Card expanded>
        <h1 className="card-title">Roles</h1>
        <div className="grid grid-cols-1 gap-5">
          <div>
            <p className="font-bold">Global Roles</p>
            {user?.globalRoles?.map((role: string) => (
              <Display
                label={""}
                value={role[0].toUpperCase() + role.slice(1)}
                key={role}
              />
            ))}
          </div>
          <div>
            <p className="font-bold">Branch Roles</p>
            {user?.branchRoles?.map((role: Record<string, any>) => (
              <div className="flex gap-2" key={role.branchId}>
                <p>
                  <span>
                    <Link
                      className="hover:underline"
                      to={`/branch/$id`}
                      params={{ id: role.branchId }}
                    >
                      {role.branchId}
                    </Link>
                  </span>{" "}
                  as <span className="capitalize">{role.roles}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </AppLayout>
  );
}
