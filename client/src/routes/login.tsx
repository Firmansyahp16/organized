import { useForm } from "@tanstack/react-form";
import Card from "../components/Card";
import InputField from "../components/Field/InputField";
import { useLogin } from "../hooks/auth.hook";

export const Route = createFileRoute({
  component: RouteComponent,
});

function RouteComponent() {
  const { mutate: login } = useLogin();
  const form = useForm({
    onSubmit({ value }: Record<string, any>) {
      login(value);
    },
  });
  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200">
      <div className="w-fit">
        <Card expanded>
          <h1 className="text-2xl font-bold text-center">Login</h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <div className="grid grid-cols-1 gap-2">
              <InputField
                form={form}
                required
                label="Email"
                name="email"
                type="email"
                placeholder="Example@mail.com"
              />
              <InputField
                form={form}
                required
                label="Password"
                name="password"
                type="password"
                placeholder="Password"
              />
            </div>
            <button type="submit" className="btn btn-primary w-full mt-4">
              Submit
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
