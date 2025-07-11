import { useState, useEffect } from "react";
import { useSetCoaches } from "../../../hooks/branch.hook";
import Card from "../../Card";
import { Table } from "../../Table";
import { Link } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { RankBadge } from "../../RankBadge";

type Props = {
  branch: Record<string, any>;
};

function CoachModal({
  id,
  coachOptions,
  oldCoaches,
}: {
  id: string;
  coachOptions: { label: string; value: string }[];
  oldCoaches: string[];
}) {
  const { mutate: setCoaches } = useSetCoaches(id);
  const [coachIds, setCoachIds] = useState<string[]>([]);
  useEffect(() => {
    setCoachIds(oldCoaches);
  }, [oldCoaches]);
  const toggleCoach = (value: string) => {
    setCoachIds((prev) =>
      prev.includes(value)
        ? prev.filter((id) => id !== value)
        : [...prev, value]
    );
  };
  return (
    <dialog className="modal" id="coach-modal">
      <div className="modal-box h-1/2 w-screen">
        <h3 className="font-bold text-lg text-center">Coach Options</h3>
        <div className="grid grid-cols-2 gap-2">
          {coachOptions.map((option) => (
            <label
              key={option.value}
              className="label cursor-pointer flex gap-2"
            >
              <input
                type="checkbox"
                value={option.value}
                checked={coachIds.includes(option.value)}
                onChange={() => toggleCoach(option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
        <div className="modal-action">
          <button
            className="btn btn-primary"
            onClick={() => {
              // console.log(coachIds);
              setCoaches({ coachIds });
              (
                document.getElementById("coach-modal") as HTMLDialogElement
              ).close();
            }}
          >
            Save
          </button>
          <button
            className="btn btn-error btn-outline"
            onClick={() =>
              (
                document.getElementById("coach-modal") as HTMLDialogElement
              ).close()
            }
          >
            Cancel
          </button>
        </div>
      </div>
    </dialog>
  );
}

export function Coaches({ branch }: Props) {
  const helper = createColumnHelper<any>();
  const column = [
    helper.accessor("id", {
      header: "ID",
      cell: (info) => (
        <Link
          to="/users/$id"
          className="hover:link"
          params={{ id: info.row.original.id }}
        >
          {info.getValue()}
        </Link>
      ),
    }),
    helper.accessor("fullName", {
      header: "Name",
      cell: (info) => info.getValue(),
    }),
    helper.accessor("email", {
      header: "Email",
      cell: (info) => info.getValue(),
    }),
    helper.accessor("rank", {
      header: "Rank",
      cell: (info) => <RankBadge rank={info.getValue()} />,
    }),
  ];
  return (
    <Card expanded>
      <div className="card-title">
        <span>Coaches</span>
        <button
          className="btn btn-ghost btn-sm btn-primary"
          onClick={() => {
            (
              document.getElementById("coach-modal") as HTMLDialogElement
            ).showModal();
          }}
        >
          Add or Edit
        </button>
        <CoachModal
          id={branch?.id}
          coachOptions={branch?.coachOptions ?? []}
          oldCoaches={
            branch?.coaches.map((c: Record<string, any>) => c.id) ?? []
          }
        />
      </div>
      <Table columns={column} data={branch?.coaches ?? []} />
    </Card>
  );
}
