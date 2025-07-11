import { redirect } from "@tanstack/react-router";
import { isAuthenticated } from "../../libs/authenticated";
import AppLayout from "../../components/Layout";
import Header from "../../components/Header";
import { useCreateBranch } from "../../hooks/branch.hook";
import { useForm } from "@tanstack/react-form";
import Card from "../../components/Card";
import InputField from "../../components/Field/InputField";

export const Route = createFileRoute({
  component: RouteComponent,
  beforeLoad: async () => {
    if (!isAuthenticated()) {
      throw redirect({ to: "/login" });
    }
  },
});

function RouteComponent() {
  const { mutate: create } = useCreateBranch();
  const createForm = useForm({
    onSubmit: ({ value }: Record<string, any>) => {
      create(value);
    },
  });
  return (
    <AppLayout>
      <Header name="New Branch" />
      <Card expanded>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createForm.handleSubmit();
          }}
          id="create-branch"
        >
          <InputField form={createForm} required label="Name" name="name" />
        </form>
        <div className="card-actions">
          <button
            form="create-branch"
            className="btn btn-primary"
            type="submit"
          >
            Create
          </button>
        </div>
      </Card>
    </AppLayout>
  );
}
