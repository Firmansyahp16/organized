import { createRoute, redirect } from "@tanstack/react-router";
import { isAuthenticated } from "../libs/authenticated";
import { Route as rootRoute } from "./__root";
import AppLayout from "../components/Layout";
import NotFound from "../components/Pages/NotFound";

export const Route = createRoute({
  path: "*",
  getParentRoute: () => rootRoute,
  component: RouteComponent,
  beforeLoad: async () => {
    if (!isAuthenticated()) {
      throw redirect({ to: "/login" });
    }
  },
});

function RouteComponent() {
  return (
    <AppLayout>
      <NotFound />
    </AppLayout>
  );
}
