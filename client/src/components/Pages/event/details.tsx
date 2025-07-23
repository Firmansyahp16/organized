import { AsExaminations } from "./examinations";
import { AsSchedule } from "./schedules";

type Props = {
  event: Record<string, any>;
};

export function Details({ event }: Props) {
  if (event.type === "schedules") {
    return <AsSchedule event={event} />;
  } else if (event.type === "examinations") {
    return <AsExaminations event={event} />;
  } else if (event.type === "events") {
    return <AsSchedule event={event} />;
  }
}
