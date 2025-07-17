import { useForm } from "@tanstack/react-form";
import { createColumnHelper } from "@tanstack/react-table";
import { useState } from "react";
import { useSetSchedule } from "../../../hooks/branch.hook";
import {
  useDeleteSchedule,
  useSetAttendance,
  useSetMaterial,
} from "../../../hooks/schedule.hook";
import {
  Block,
  parseMarkdown,
  serializeMarkdown,
} from "../../../libs/mdHelper";
import Card from "../../Card";
import CheckboxField from "../../Field/CheckboxField";
import InputField from "../../Field/InputField";
import { MDBuilder } from "../../MDBuilder";
import { MDEditor } from "../../MDEditor";
import { RankBadge } from "../../RankBadge";
import { Table } from "../../Table";

const helper = createColumnHelper<any>();

function AttendanceModal({
  scheduleId,
  members,
}: {
  scheduleId: string;
  members: Record<string, any>[];
}) {
  const { mutate: setAttendance } = useSetAttendance(scheduleId);
  const [memberList, setMemberList] = useState<
    {
      id: string;
      status: string;
    }[]
  >(members.map((member) => ({ id: member.id, status: "absence" })));
  const attendanceForm = useForm({
    onSubmit: ({ value }: any) => {
      const valueMembers = Object.keys(value).map((id) => ({
        id,
        status: value[id],
      }));
      const newMemberList = memberList.map((member) => {
        const found = valueMembers.find((v) => v.id === member.id);
        if (!found) {
          return { ...member, status: "absence" };
        }
        return member;
      });
      setAttendance(newMemberList);
      // console.log(newMemberList);
    },
  });
  const columns = [
    helper.accessor("fullName", {
      header: "Name",
      cell: (info) => info.getValue(),
    }),
    helper.accessor("rank", {
      header: "Rank",
      cell: (info) => <RankBadge rank={info.getValue()} />,
    }),
    helper.display({
      id: "status",
      header: "Status",
      cell: (info) => {
        const name = `${String(info.row.original.id)}.status`;
        return (
          <attendanceForm.Field
            name={name}
            children={(field) => (
              <label>
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  onChange={(e) => {
                    const index = memberList.findIndex(
                      (member) => member.id === info.row.original.id
                    );
                    if (index !== -1) {
                      memberList[index].status = e.target.checked
                        ? "present"
                        : "absence";
                      setMemberList([...memberList]);
                    }
                    field.handleChange(
                      e.target.checked ? "present" : "absence"
                    );
                  }}
                  checked={field.state.value === "present"}
                />
                <span
                  className={`ml-2 capitalize ${
                    field.state.value === "present"
                      ? "text-success"
                      : "text-error"
                  }`}
                >
                  {String(field.state.value || "absence")}
                </span>
              </label>
            )}
          />
        );
      },
    }),
  ];
  return (
    <dialog className="modal" id={`${scheduleId}-setAttendance`}>
      <div className="modal-box w-fit max-w-full grid gap-5">
        <h3 className="font-bold text-lg">Set Attendance</h3>
        <form
          id={`${scheduleId}-setAttendanceForm`}
          onSubmit={(e) => {
            e.preventDefault();
            attendanceForm.handleSubmit();
          }}
        >
          <Table columns={columns} data={members} />
        </form>
        <div className="modal-action">
          <button
            type="submit"
            form={`${scheduleId}-setAttendanceForm`}
            className="join-item btn btn-primary"
          >
            Save
          </button>
          <button
            className="join-item btn btn-error btn-outline"
            onClick={() => {
              (
                document.getElementById(
                  `${scheduleId}-setAttendance`
                ) as HTMLDialogElement
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

function ViewModal({
  scheduleId,
  details,
  members,
}: {
  scheduleId: string;
  details: { id: string; status: string }[];
  members: Record<string, any>[];
}) {
  const columns = [
    helper.accessor("fullName", {
      header: "Name",
    }),
    helper.accessor("rank", {
      header: "Rank",
    }),
    helper.accessor("status", {
      header: "Status",
      cell: (data) => {
        if (data.getValue() === "absence") {
          return <span className="font-bold text-error">Absence</span>;
        } else {
          return <span className="font-bold text-success">Present</span>;
        }
      },
    }),
  ];
  const attendanceData = members.map((member) => {
    const found = details.find((d) => d.id === member.id);
    return {
      fullName: member.fullName,
      rank: member.rank,
      status: found?.status,
    };
  });
  return (
    <dialog className="modal" id={`${scheduleId}-view`}>
      <div className="modal-box w-fit max-w-full grid gap-5">
        <h3 className="font-bold text-lg text-center">View Attendance</h3>
        <div className="grid gap-2">
          <p>
            Total Present:{" "}
            {details.filter((d) => d.status === "present").length}
          </p>
          <p>
            Total Absence:{" "}
            {details.filter((d) => d.status === "absence").length}
          </p>
        </div>
        <Table columns={columns} data={attendanceData} />
        <div className="modal-action">
          <button
            className="btn btn-error btn-outline"
            onClick={() => {
              (
                document.getElementById(
                  `${scheduleId}-view`
                ) as HTMLDialogElement
              ).close();
            }}
          >
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
}

export function Schedules({ branch }: { branch: Record<string, any> }) {
  const { mutate: setSchedule } = useSetSchedule(branch?.id);
  const scheduleForm = useForm({
    onSubmit: ({ value }: Record<string, any>) => {
      setSchedule(value);
    },
  });
  const { mutate: deleteSchedule } = useDeleteSchedule();
  const { mutate: setMaterial } = useSetMaterial();
  const [showForm, setShowForm] = useState(false);
  const [openedModalId, setOpenedModalId] = useState<string | null>(null);
  const [activeBlocks, setActiveBlocks] = useState<Block[]>([]);
  const [builderState, setBuilderState] = useState<Record<string, Block[]>>({});
  const columns = [
    helper.accessor("title", {
      header: "Title",
    }),
    helper.accessor("date", {
      header: "Date",
      cell: (info) =>
        Intl.DateTimeFormat("id-ID", {
          dateStyle: "medium",
          timeStyle: "short",
        })
          .format(new Date(info.getValue()))
          .toString(),
    }),
    helper.display({
      id: "material",
      header: "Material",
      cell: (info) => {
        const scheduleId = info.row.original.id;
        const schedule = branch.schedules.find((s: any) => s.id === scheduleId);
        const material = schedule?.material;
        return (
          <button
            className="btn btn-outline btn-accent btn-sm"
            onClick={() => {
              setOpenedModalId(scheduleId);

              const builderBlocks = builderState[scheduleId];
              if (builderBlocks?.length > 0) {
                setActiveBlocks(builderBlocks);
              } else if (material && material.trim() !== "") {
                const parsed = parseMarkdown(material);
                setActiveBlocks(parsed);
                setBuilderState((prev) => ({ ...prev, [scheduleId]: parsed }));
              } else {
                setActiveBlocks([]);
              }
            }}
          >
            {material && material.trim() !== ""
              ? "Edit Material"
              : "Set Material"}
          </button>
        );
      },
    }),
    helper.display({
      id: "attendanceActions",
      header: "Attendance",
      cell: (info) => {
        const scheduleId = info.row.original.id;
        const schedule = branch.schedules.find(
          (schedule: any) => schedule.id === scheduleId
        );
        return (
          <>
            {branch.schedules.find(
              (schedule: any) =>
                schedule.id === scheduleId && schedule?.attendances?.id
            ) ? (
              <>
                <ViewModal
                  scheduleId={scheduleId}
                  details={schedule.attendances?.details || []}
                  members={branch.members}
                />
                <button
                  className="btn btn-outline btn-sm btn-primary"
                  onClick={() =>
                    (
                      document.getElementById(
                        `${scheduleId}-view`
                      ) as HTMLDialogElement
                    ).showModal()
                  }
                >
                  View Attendance
                </button>
              </>
            ) : (
              <>
                <AttendanceModal
                  scheduleId={scheduleId}
                  members={branch.members}
                />
                <button
                  className="btn btn-outline btn-sm btn-primary"
                  onClick={() =>
                    (
                      document.getElementById(
                        `${scheduleId}-setAttendance`
                      ) as HTMLDialogElement
                    ).showModal()
                  }
                >
                  Set Attendance
                </button>
              </>
            )}
          </>
        );
      },
    }),
    helper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => {
        return (
          <div className="join">
            <button
              className="btn btn-outline btn-sm btn-error"
              onClick={() => deleteSchedule(info.row.original.id)}
            >
              Delete
            </button>
          </div>
        );
      },
    }),
  ];
  return (
    <Card expanded>
      <div className="card-title">
        Schedules &nbsp;
        {showForm ? (
          <>
            <button
              className="btn btn-ghost btn-sm btn-error"
              onClick={() => setShowForm(false)}
            >
              Close
            </button>
          </>
        ) : (
          <button
            className="btn btn-ghost btn-sm btn-primary"
            onClick={() => setShowForm(true)}
          >
            Add
          </button>
        )}
      </div>
      <MDEditor
        id="schedule-material-modal"
        title="Material"
        open={openedModalId !== null}
        onClose={() => setOpenedModalId(null)}
        mutation={async () => {
          if (!openedModalId) return;
          const markdown = serializeMarkdown(activeBlocks);
          setMaterial({ id: openedModalId, material: markdown });
          setBuilderState((prev) => ({
            ...prev,
            [openedModalId]: activeBlocks,
          }));
          setOpenedModalId(null);
        }}
      >
        <MDBuilder blocks={activeBlocks} setBlocks={setActiveBlocks} />
      </MDEditor>
      {showForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            scheduleForm.handleSubmit();
          }}
        >
          <div className="flex gap-2 place-items-end">
            <InputField
              form={scheduleForm}
              name="count"
              type="number"
              label="Count"
            />
            <InputField
              form={scheduleForm}
              name="startDate"
              type="datetime-local"
              label="Start Date"
            />
            <CheckboxField
              form={scheduleForm}
              name="resetSchedule"
              label="Reset Schedule"
              options={[
                { label: "Yes", value: true },
                { label: "No", value: false },
              ]}
            />
            <div className="card-actions">
              <button type="submit" className="btn btn-primary">
                Save
              </button>
            </div>
          </div>
        </form>
      )}
      <Table columns={columns} data={branch?.schedules ?? []} />
    </Card>
  );
}
