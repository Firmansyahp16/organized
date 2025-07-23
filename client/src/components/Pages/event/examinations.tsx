import { createColumnHelper } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { useGetBranchParticipated } from "../../../hooks/event.hook";
import Card from "../../Card";
import { RankBadge } from "../../RankBadge";

export function AsExaminations({ event }: { event: Record<string, any> }) {
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
    </Card>
  );
}
