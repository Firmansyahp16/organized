import { useForm } from "@tanstack/react-form";
import Header from "../../components/Header";
import AppLayout from "../../components/Layout";
import { isAuthenticated } from "../../libs/authenticated";
import { redirect } from "@tanstack/react-router";
import { useCreateEvent, useGetBranchOptions } from "../../hooks/event.hook";
import Card from "../../components/Card";
import InputField from "../../components/Field/InputField";
import OptionField from "../../components/Field/OptionField";
import { useEffect, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { Table } from "../../components/Table";

export const Route = createFileRoute({
  component: RouteComponent,
  beforeLoad: async () => {
    if (!isAuthenticated()) {
      throw redirect({ to: "/login" });
    }
  },
});

function BranchModal({
  branchIds,
  setBranchIds,
}: {
  branchIds: string[];
  setBranchIds: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const { data: branchOptions } = useGetBranchOptions();
  const helper = createColumnHelper<any>();
  const columns = [
    helper.accessor("name", {
      header: "Name",
      cell: (info) => info.getValue(),
    }),
    helper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => {
        const isSelected = branchIds.includes(info.row.original.id);
        return (
          <div className="join">
            <input
              type="checkbox"
              className="checkbox checkbox-primary"
              checked={isSelected}
              onChange={() => {
                if (isSelected) {
                  setBranchIds(
                    branchIds.filter((id) => id !== info.row.original.id)
                  );
                } else {
                  setBranchIds([...branchIds, info.row.original.id]);
                }
              }}
            />
          </div>
        );
      },
    }),
  ];
  return (
    <dialog id="branch-modal" className="modal">
      <div className="modal-box w-fit max-w-full grid gap-5">
        <h3 className="font-bold text-lg">Select Branch</h3>
        <Table columns={columns} data={branchOptions ?? []} />
        <div className="modal-action">
          <button
            type="button"
            className="join-item btn btn-primary"
            onClick={() => {
              setBranchIds(branchIds);
              (
                document.getElementById("branch-modal") as HTMLDialogElement
              ).close();
            }}
          >
            Save
          </button>
          <button
            className="join-item btn btn-error btn-outline"
            onClick={() => {
              (
                document.getElementById("branch-modal") as HTMLDialogElement
              ).close();
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </dialog>
  );
}

function RouteComponent() {
  const { mutate: createEvent } = useCreateEvent();
  const [branchIds, setBranchIds] = useState<string[]>([]);
  useEffect(() => {
    console.log(branchIds);
  }, [branchIds]);
  const eventForm = useForm({
    onSubmit({ value }: Record<string, any>) {
      // createEvent(value);
      value.branchIds = branchIds;
      console.log(value);
    },
  });
  return (
    <AppLayout>
      <Header name="New Event" />
      <Card expanded>
        <form
          id="event-form"
          onSubmit={(e) => {
            e.preventDefault();
            eventForm.handleSubmit();
          }}
        >
          <div className="grid grid-cols-2 gap-5">
            <InputField form={eventForm} name="title" label="Title" required />
            <InputField
              form={eventForm}
              name="description"
              label="Description"
              type="textarea"
              required
            />
            <InputField
              form={eventForm}
              name="date"
              label="Date"
              type="datetime-local"
              required
            />
            <div className="grid grid-cols-1 gap-1">
              <BranchModal branchIds={branchIds} setBranchIds={setBranchIds} />
              <p className="label">Branches</p>
              <button
                className="btn btn-primary w-fit"
                onClick={() => {
                  (
                    document.getElementById("branch-modal") as HTMLDialogElement
                  ).showModal();
                }}
              >
                Set Branches
              </button>
            </div>
            <OptionField
              form={eventForm}
              name="type"
              label="Type"
              options={[
                { label: "Schedules", value: "schedules" },
                { label: "Examinations", value: "examination" },
              ]}
              required
            />
          </div>
        </form>
        <div className="card-action">
          <button
            type="submit"
            className="join-item btn btn-primary"
            form="event-form"
          >
            Create
          </button>
        </div>
      </Card>
    </AppLayout>
  );
}
