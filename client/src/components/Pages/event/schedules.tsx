import { Link } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import {
  useGetBranchParticipated,
  useSetAttendance,
  useSetParticipant,
} from "../../../hooks/event.hook";
import Card from "../../Card";
import { RankBadge } from "../../RankBadge";
import { Table } from "../../Table";

function SetParticipantModal({
  id,
  participants,
}: {
  id: string;
  participants: {
    [branchId: string]: {
      id: string;
      name: string;
      rank: string;
    }[];
  };
}) {
  const [result, setResult] = useState<{ id: string; rank: string }[]>([]);
  const isSelected = (id: string) => result.some((r) => r.id === id);
  const { mutate: setParticipant } = useSetParticipant(id);

  const helper = createColumnHelper<any>();
  const columns = [
    helper.accessor("id", {
      header: "ID",
    }),
    helper.accessor("name", {
      header: "Name",
    }),
    helper.accessor("rank", {
      header: "Rank",
      cell: (info) => <RankBadge rank={info.getValue()} />,
    }),
    helper.display({
      id: "action",
      header: "Included",
      cell: (info) => {
        const original = info.row.original;
        const checked = isSelected(original.id);

        const handleChange = () => {
          setResult((prev) => {
            if (checked) {
              // Uncheck: remove from result
              return prev.filter((r) => r.id !== original.id);
            } else {
              // Check: add to result
              return [...prev, { id: original.id, rank: original.rank }];
            }
          });
        };

        return (
          <input
            type="checkbox"
            className="checkbox checkbox-primary"
            checked={checked}
            onChange={handleChange}
          />
        );
      },
    }),
  ];

  const branchIds = Object.keys(participants);
  const [branchId, setBranchId] = useState<string>(branchIds[0]);
  const currentIndex = branchIds.indexOf(branchId);

  const nextBranch = () => {
    const nextIndex = (currentIndex + 1) % branchIds.length;
    setBranchId(branchIds[nextIndex]);
  };

  const prevBranch = () => {
    const prevIndex = (currentIndex - 1 + branchIds.length) % branchIds.length;
    setBranchId(branchIds[prevIndex]);
  };

  return (
    <dialog id="set-participant-modal" className="modal">
      <div className="modal-box w-fit max-w-full grid gap-5">
        <h3 className="font-bold text-lg text-center">Set Participant</h3>
        <BranchNavigation
          branchId={branchId}
          onNext={nextBranch}
          onPrev={prevBranch}
        />
        <Table
          columns={columns}
          data={participants?.[branchId] ?? []}
          count={participants?.[branchId]?.length ?? 0}
        />
        <div className="modal-action">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setParticipant({ participants: result });
              (
                document.getElementById(
                  "set-participant-modal"
                ) as HTMLDialogElement
              ).close();
            }}
          >
            Set
          </button>
          <button
            type="button"
            className="btn btn-error btn-outline hover:text-white"
            onClick={() => {
              (
                document.getElementById(
                  "set-participant-modal"
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

function SetAttendanceModal({
  id,
  participants,
}: {
  id: string;
  participants: {
    [branchId: string]: {
      id: string;
      name: string;
      rank: string;
    }[];
  };
}) {
  const [result, setResult] = useState<
    { id: string; status: "present" | "absence" }[]
  >([]);
  const { mutate: setAttendance } = useSetAttendance(id);

  const branchIds = Object.keys(participants);
  const [branchId, setBranchId] = useState<string>(branchIds[0]);
  const currentIndex = branchIds.indexOf(branchId);

  const nextBranch = () => {
    const nextIndex = (currentIndex + 1) % branchIds.length;
    setBranchId(branchIds[nextIndex]);
  };

  const prevBranch = () => {
    const prevIndex = (currentIndex - 1 + branchIds.length) % branchIds.length;
    setBranchId(branchIds[prevIndex]);
  };

  const helper = createColumnHelper<any>();
  const columns = [
    helper.accessor("id", {
      header: "ID",
    }),
    helper.accessor("name", {
      header: "Name",
    }),
    helper.accessor("rank", {
      header: "Rank",
      cell: (info) => <RankBadge rank={info.getValue()} />,
    }),
    helper.display({
      id: "status",
      header: "Status",
      cell: (info) => {
        const original = info.row.original;
        const checked =
          result.find((r) => r.id === original.id)?.status === "present";

        const handleChange = () => {
          setResult((prev) => {
            const existing = prev.find((r) => r.id === original.id);
            if (existing) {
              return prev.map((r) =>
                r.id === original.id
                  ? {
                      ...r,
                      status: r.status === "present" ? "absence" : "present",
                    }
                  : r
              );
            } else {
              // Default ke 'present' jika belum ada
              return [...prev, { id: original.id, status: "present" }];
            }
          });
        };

        return (
          <>
            <input
              type="checkbox"
              className="checkbox checkbox-primary"
              checked={checked}
              onChange={handleChange}
            />
            <span
              className={`ml-2 capitalize ${
                checked ? "text-success" : "text-error"
              }`}
            >
              {checked ? "present" : "absence"}
            </span>
          </>
        );
      },
    }),
  ];
  return (
    <dialog id="set-attendance-modal" className="modal">
      <div className="modal-box w-fit max-w-full grid gap-5">
        <h3 className="font-bold text-lg text-center">Set Attendance</h3>
        <BranchNavigation
          branchId={branchId}
          onNext={nextBranch}
          onPrev={prevBranch}
        />
        <Table
          columns={columns}
          data={participants?.[branchId] ?? []}
          count={participants?.[branchId]?.length ?? 0}
        />
        <div className="modal-action">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setAttendance(result);
              (
                document.getElementById(
                  "set-attendance-modal"
                ) as HTMLDialogElement
              ).close();
            }}
          >
            Set
          </button>
          <button
            type="button"
            className="btn btn-error btn-outline hover:text-white"
            onClick={() => {
              (
                document.getElementById(
                  "set-attendance-modal"
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

function BranchNavigation({
  branchId,
  onNext,
  onPrev,
}: {
  branchId: string;
  onNext: () => void;
  onPrev: () => void;
}) {
  return (
    <div className="flex place-items-center gap-4">
      <p className="font-bold">
        Branch:{" "}
        <Link
          to="/branch/$id"
          className="hover:underline"
          params={{ id: branchId }}
        >
          {branchId}
        </Link>
      </p>
      <div className="join">
        <button onClick={onPrev} className="btn btn-sm btn-primary btn-outline">
          Previous
        </button>
        <button onClick={onNext} className="btn btn-sm btn-primary btn-outline">
          Next
        </button>
      </div>
    </div>
  );
}

export function AsSchedule({ event }: { event: Record<string, any> }) {
  const helper = createColumnHelper<any>();
  const defaultColumns = [
    helper.accessor("id", {
      header: "ID",
    }),
    helper.accessor("name", {
      header: "Name",
    }),
    helper.accessor("rank", {
      header: "Rank",
      cell: (info) => <RankBadge rank={info.getValue()} />,
    }),
  ];
  const finalColumns = [
    ...defaultColumns,
    helper.accessor("status", {
      header: "Status",
      cell: (info) => {
        if (info.getValue() === "absence") {
          return <span className="font-bold text-error">Absence</span>;
        } else {
          return <span className="font-bold text-success">Present</span>;
        }
      },
    }),
  ];

  const { data: participants } = useGetBranchParticipated(event?.id);

  const branchIds = Object.keys(participants ?? {});
  const [branchId, setBranchId] = useState("");
  useEffect(() => {
    if (!branchId && participants && Object.keys(participants).length > 0) {
      setBranchId(Object.keys(participants)[0]);
    }
  }, [participants, branchId]);
  const currentIndex = branchIds.indexOf(branchId);

  const nextBranch = () => {
    const nextIndex = (currentIndex + 1) % branchIds.length;
    setBranchId(branchIds[nextIndex]);
  };

  const prevBranch = () => {
    const prevIndex = (currentIndex - 1 + branchIds.length) % branchIds.length;
    setBranchId(branchIds[prevIndex]);
  };

  function getValidParticipants(
    participants: { id: string; rank: string }[],
    fullData: {
      [branchId: string]: { id: string; name: string; rank: string }[];
    }
  ) {
    const filtered: {
      [branchId: string]: { id: string; name: string; rank: string }[];
    } = {};
    for (const [branchId, users] of Object.entries(fullData)) {
      const validUsers = users.filter((u) =>
        participants.find((p) => p.id === u.id)
      );
      if (validUsers.length > 0) {
        filtered[branchId] = validUsers;
      }
    }
    return filtered;
  }

  const validParticipants = getValidParticipants(
    event?.participants ?? [],
    participants ?? {}
  );

  return (
    <Card expanded>
      <h1 className="card-title">Details</h1>
      {!event?.participants && (
        <>
          <SetParticipantModal
            participants={participants ?? {}}
            id={event.id}
          />
          <button
            className="btn btn-primary w-fit"
            onClick={() => {
              (
                document.getElementById(
                  "set-participant-modal"
                ) as HTMLDialogElement
              ).showModal();
            }}
          >
            Set Participant
          </button>
        </>
      )}
      {event?.participants && !event?.attendances && (
        <>
          <SetAttendanceModal
            participants={validParticipants ?? {}}
            id={event.id}
          />
          <button
            className="btn btn-primary w-fit"
            onClick={() => {
              (
                document.getElementById(
                  "set-attendance-modal"
                ) as HTMLDialogElement
              ).showModal();
            }}
          >
            Set Attendance
          </button>
        </>
      )}
      {event?.attendances && (
        <div className="grid gap-2">
          <BranchNavigation
            branchId={branchId}
            onNext={nextBranch}
            onPrev={prevBranch}
          />
          <Table
            columns={finalColumns}
            data={validParticipants[branchId] ?? []}
          />
        </div>
      )}
    </Card>
  );
}
