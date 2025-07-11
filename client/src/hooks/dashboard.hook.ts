import { useQuery } from "@tanstack/react-query";
import { instance } from "../libs/axios";

export function useGetDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const response = await instance.get("/Dashboard", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    },
  });
}
