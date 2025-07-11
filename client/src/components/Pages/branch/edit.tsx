import { useForm } from "@tanstack/react-form";
import { useEditBranch } from "../../../hooks/branch.hook";
import Card from "../../Card";
import InputField from "../../Field/InputField";
export function Edit({ branch }: { branch: Record<string, any> }) {
  const { mutate: editBranch, isPending } = useEditBranch(branch?.id);
  const editForm = useForm({
    onSubmit: ({ value }: Record<string, any>) => {
      editBranch(value);
    },
  });
  return (
    <Card expanded>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          editForm.handleSubmit();
        }}
      >
        <div className="grid gap-2">
          <div className="grid grid-cols-2 gap-5">
            <InputField
              form={editForm}
              name="name"
              label="Name"
              required
              defaultValue={branch?.name}
            />
          </div>
          <div className="card-actions">
            <button
              className="btn btn-primary"
              type="submit"
              disabled={isPending}
            >
              {isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </form>
    </Card>
  );
}
