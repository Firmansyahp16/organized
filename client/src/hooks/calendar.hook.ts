import { useQuery } from "@tanstack/react-query";
import { instance } from "../libs/axios";

export function useGetCalendar() {
  return useQuery({
    queryKey: ["calendar"],
    queryFn: async () => {
      const schedules = (
        await instance.get("/Schedules", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
      ).data.map((schedule: any) => ({
        id: schedule.id,
        title: schedule.title,
        date: schedule.date,
        branches: [schedule.branchId],
      }));
      const examinations = (
        await instance.get("/Examinations", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
      ).data.map((examination: any) => ({
        id: examination.id,
        title: examination.title,
        date: examination.date,
        branches: [examination.branchId],
      }));
      const events = (
        await instance.get("/Events", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
      ).data.map((event: any) => ({
        id: event.id,
        title: event.title,
        date: event.date,
        branches: event.branchIds,
      }));
      return {
        schedules,
        examinations,
        events,
      };
    },
  });
}
