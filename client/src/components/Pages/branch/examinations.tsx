import { createColumnHelper } from "@tanstack/react-table";
import { Table } from "../../Table";
import Card from "../../Card";
import { useSetParticipants } from "../../../hooks/branch.hook";
import { useEffect, useState } from "react";
import { RankBadge } from "../../RankBadge";
import { useSetResult } from "../../../hooks/exam.hook";
import { useForm } from "@tanstack/react-form";
import InputField from "../../Field/InputField";

const helper = createColumnHelper<any>();

function ParticipantsModal({
  examId,
  branchId,
  members,
}: {
  examId: string;
  branchId: string;
  members: Record<string, any>[];
}) {
  const { mutate: setParticipants } = useSetParticipants(examId);
  const [auto, setAuto] = useState(true);
  const [list, setList] = useState<string[]>([]);
  const helper = createColumnHelper<any>();
  const columns = [
    helper.accessor("fullName", {
      header: "Name",
    }),
    helper.accessor("rank", {
      header: "Rank",
      cell: (info) => <RankBadge rank={info.getValue()} />,
    }),
    helper.display({
      id: "action",
      header: "Action",
      cell: (info) => {
        const rowId = info.row.original.id;
        const exists = list.includes(rowId);
        return (
          <input
            type="checkbox"
            className="checkbox checkbox-primary"
            checked={exists}
            onChange={() => {
              setList((prev) =>
                exists
                  ? prev.filter((item) => item !== rowId)
                  : [...prev, rowId]
              );
            }}
          />
        );
      },
    }),
  ];
  return (
    <dialog className="modal" id={`${examId}-${branchId}-participants-modal`}>
      <div className="modal-box w-fit max-w-full grid gap-5">
        <h3 className="font-bold text-lg text-center">Set Participants</h3>
        <div className="grid grid-cols-2 gap-5 place-items-center justify-center">
          <label htmlFor="auto" className="flex gap-2">
            <input
              type="radio"
              name="auto"
              className="radio radio-primary"
              onChange={() => setAuto(true)}
            />
            <span>Auto</span>
          </label>
          <label htmlFor="manual" className="flex gap-2">
            <input
              type="radio"
              name="auto"
              className="radio radio-primary"
              onChange={() => setAuto(false)}
            />
            <span>Manual</span>
          </label>
        </div>
        {!auto && (
          <>
            <Table columns={columns} data={members} />
          </>
        )}
        <div className="modal-action">
          <button
            className="btn btn-primary"
            onClick={() => {
              if (auto) {
                setParticipants({
                  auto: true,
                });
              } else {
                setParticipants({
                  auto: false,
                  participants: {
                    [branchId]: list,
                  },
                });
              }
              (
                document.getElementById(
                  `${examId}-${branchId}-participants-modal`
                ) as HTMLDialogElement
              )?.close();
            }}
          >
            Save
          </button>
          <button
            className="btn btn-error btn-outline"
            onClick={() => {
              setAuto(false);
              setList([]);
              (
                document.getElementById(
                  `${examId}-${branchId}-participants-modal`
                ) as HTMLDialogElement
              )?.close();
            }}
          >
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
}

function ResultsModal({
  examId,
  branchId,
  participants,
}: {
  examId: string;
  branchId: string;
  participants: Record<string, any>[];
}) {
  const { mutate: setResult } = useSetResult(examId);
  const [list, setList] = useState<{
    [userId: string]: {
      kihon: string;
      kata: string;
      kumite: string;
    };
  }>({});
  useEffect(() => {
    participants.forEach((participant) => {
      setList((prev) => ({
        ...prev,
        [participant.id]: {
          kihon: "b",
          kata: "b",
          kumite: "b",
        },
      }));
    });
  }, [participants]);
  const helper = createColumnHelper<any>();
  const columns = [
    helper.accessor("fullName", {
      header: "Name",
    }),
    helper.accessor("rank", {
      header: "Rank",
      cell: (info) => <RankBadge rank={info.getValue()} />,
    }),
    helper.display({
      id: "action",
      header: "Action",
      cell: (info) => {
        const rowId = info.row.original.id;
        return (
          <div className="grid grid-cols-3 gap-2">
            <div className="flex gap-2 place-items-center">
              <span className="font-bold">Kihon</span>
              <select
                className="select select-bordered"
                value={list[rowId]?.kihon}
                onChange={(e) => {
                  setList((prev) => ({
                    ...prev,
                    [rowId]: {
                      ...prev[rowId],
                      kihon: e.target.value,
                    },
                  }));
                }}
              >
                <option value="" className="font-bold text-gray-500">
                  Select Score
                </option>
                <option value="a" className="font-bold text-blue-500">
                  Special
                </option>
                <option value="b" className="font-bold text-green-500">
                  Good
                </option>
                <option value="c" className="font-bold text-red-500">
                  Bad
                </option>
              </select>
            </div>
            <div className="flex gap-2 place-items-center">
              <span className="font-bold">Kata</span>
              <select
                className="select select-bordered"
                value={list[rowId]?.kata}
                onChange={(e) => {
                  setList((prev) => ({
                    ...prev,
                    [rowId]: {
                      ...prev[rowId],
                      kata: e.target.value,
                    },
                  }));
                }}
              >
                <option value="" className="font-bold text-gray-500">
                  Select Score
                </option>
                <option value="a" className="font-bold text-blue-500">
                  Special
                </option>
                <option value="b" className="font-bold text-green-500">
                  Good
                </option>
                <option value="c" className="font-bold text-red-500">
                  Bad
                </option>
              </select>
            </div>
            <div className="flex gap-2 place-items-center">
              <span className="font-bold">Kumite</span>
              <select
                className="select select-bordered"
                value={list[rowId]?.kumite}
                onChange={(e) => {
                  setList((prev) => ({
                    ...prev,
                    [rowId]: {
                      ...prev[rowId],
                      kumite: e.target.value,
                    },
                  }));
                }}
              >
                <option value="" className="font-bold text-gray-500">
                  Select Score
                </option>
                <option value="a" className="font-bold text-blue-500">
                  Special
                </option>
                <option value="b" className="font-bold text-green-500">
                  Good
                </option>
                <option value="c" className="font-bold text-red-500">
                  Bad
                </option>
              </select>
            </div>
          </div>
        );
      },
    }),
  ];
  return (
    <dialog className="modal" id={`${examId}-${branchId}-results-modal`}>
      <div className="modal-box w-fit max-w-full grid gap-5">
        <h3 className="font-bold text-lg text-center">View Results</h3>
        <Table columns={columns} data={participants} />
        <div className="modal-action">
          <button
            className="btn btn-primary"
            onClick={() => {
              setResult(list);
              (
                document.getElementById(
                  `${examId}-${branchId}-results-modal`
                ) as HTMLDialogElement
              )?.close();
            }}
          >
            Save
          </button>
          <button
            className="btn btn-error btn-outline"
            onClick={() =>
              (
                document.getElementById(
                  `${examId}-${branchId}-results-modal`
                ) as HTMLDialogElement
              )?.close()
            }
          >
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
}

function ViewModal({
  id,
  data,
  type,
}: {
  id: string;
  data: Record<string, any>[];
  type: string;
}) {
  const helper = createColumnHelper<any>();
  const columns = [
    helper.accessor("fullName", {
      header: "Name",
    }),
    ...(type === "results"
      ? [
          helper.accessor("details", {
            header: "Details",
            cell: (info) => {
              const details: Record<string, string> = info.getValue();
              return (
                <div className="grid grid-cols-1 gap-2">
                  <div className="grid grid-cols-2 gap-2 justify-around">
                    <span className="font-bold">Kihon</span>
                    <span className="capitalize">{details.kihon}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 justify-around">
                    <span className="font-bold">Kata</span>
                    <span className="capitalize">{details.kata}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 justify-around">
                    <span className="font-bold">Kumite</span>
                    <span className="capitalize">{details.kumite}</span>
                  </div>
                </div>
              );
            },
          }),
          helper.accessor("result", {
            header: "Result",
            cell: (info) => (
              <span className="font-bold capitalize">{info.getValue()}</span>
            ),
          }),
          helper.accessor("oldRank", {
            header: "Old Rank",
            cell: (info) => <RankBadge rank={info.getValue()} />,
          }),
          helper.accessor("newRank", {
            header: "New Rank",
            cell: (info) => <RankBadge rank={info.getValue()} />,
          }),
        ]
      : []),
  ];
  return (
    <dialog className="modal" id={`${id}-view-modal-${type}`}>
      <div className="modal-box w-fit max-w-full grid gap-5">
        <h3 className="font-bold text-lg text-center capitalize">
          View {type}
        </h3>
        <Table columns={columns} data={data} />
        <div className="modal-action">
          <button
            className="btn btn-error btn-outline"
            onClick={() =>
              (
                document.getElementById(
                  `${id}-view-modal-${type}`
                ) as HTMLDialogElement
              )?.close()
            }
          >
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
}

export function Examinations({ branch }: { branch: Record<string, any> }) {
  const columns = [
    helper.accessor("id", {
      header: "ID",
    }),
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
      id: "action",
      header: "Action",
      cell: (info) => {
        const participants = info.row.original.participants?.[branch?.id];
        const results = info.row.original.results ?? {};
        const resultUserIds = Object.keys(results);
        const id = info.row.original.id;
        return (
          <div className="join">
            {participants.length > 0 ? (
              <>
                <ViewModal
                  id={info.row.original.id}
                  data={branch?.members
                    ?.filter((member: Record<string, any>) =>
                      participants.some(
                        (p: Record<string, any>) => p.id === member.id
                      )
                    )
                    .map((member: Record<string, any>) => {
                      const participant = participants.find(
                        (p: Record<string, any>) => p.id === member.id
                      );
                      return {
                        ...member,
                        rank: participant?.rank,
                      };
                    })}
                  type="participants"
                />
                <button
                  className="join-item btn btn-outline btn-primary"
                  onClick={() => {
                    const modal = document.getElementById(
                      `${id}-view-modal-participants`
                    ) as HTMLDialogElement;
                    modal.showModal();
                  }}
                >
                  View Participants
                </button>
              </>
            ) : (
              <>
                <ParticipantsModal
                  examId={info.row.original.id}
                  branchId={branch?.id}
                  members={branch?.members}
                />
                <button
                  className="join-item btn btn-outline btn-primary"
                  onClick={() => {
                    const modal = document.getElementById(
                      `${info.row.original.id}-${branch?.id}-participants-modal`
                    ) as HTMLDialogElement;
                    modal.showModal();
                  }}
                >
                  Set Participants
                </button>
              </>
            )}
            {resultUserIds.length > 0 ? (
              <>
                <ViewModal
                  id={info.row.original.id}
                  data={branch?.members
                    ?.filter((member: Record<string, any>) =>
                      resultUserIds.includes(member.id)
                    )
                    .map((member: Record<string, any>) => {
                      const result = results[member.id];
                      return {
                        ...member,
                        oldRank: participants.find(
                          (p: Record<string, any>) => p.id === member.id
                        )?.rank,
                        newRank: member?.rank,
                        result: result?.result,
                        details: result,
                      };
                    })}
                  type="results"
                />
                <button
                  className="join-item btn btn-outline btn-primary"
                  onClick={() => {
                    const modal = document.getElementById(
                      `${id}-view-modal-results`
                    ) as HTMLDialogElement;
                    modal.showModal();
                  }}
                >
                  View Results
                </button>
              </>
            ) : (
              <>
                <ResultsModal
                  examId={info.row.original.id}
                  branchId={branch?.id}
                  participants={branch?.members?.filter(
                    (member: Record<string, any>) =>
                      participants.some(
                        (p: Record<string, any>) => p.id === member.id
                      )
                  )}
                />
                <button
                  className="join-item btn btn-outline btn-primary"
                  onClick={() => {
                    const modal = document.getElementById(
                      `${info.row.original.id}-${branch?.id}-results-modal`
                    ) as HTMLDialogElement;
                    modal.showModal();
                  }}
                >
                  Set Results
                </button>
              </>
            )}
          </div>
        );
      },
    }),
  ];
  const [showForm, setShowForm] = useState(false);
  const examinationForm = useForm();
  return (
    <Card expanded>
      <div className="card-title">
        Examinations &nbsp;
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
      {showForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            examinationForm.handleSubmit();
          }}
        >
          <div className="flex gap-2 place-items-end">
            <InputField
              form={examinationForm}
              name="title"
              type="text"
              label="Title"
            />
            <InputField
              form={examinationForm}
              name="data"
              type="datetime-local"
              label="Date"
            />
            <div className="card-actions">
              <button type="submit" className="btn btn-primary">
                Save
              </button>
            </div>
          </div>
        </form>
      )}
      <Table columns={columns} data={branch.examinations} />
    </Card>
  );
}
