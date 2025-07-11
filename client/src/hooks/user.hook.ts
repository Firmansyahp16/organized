import { useQuery } from "@tanstack/react-query";
import { PaginationState } from "@tanstack/react-table";
import { instance } from "../libs/axios";

export function useGetAllUsers(pagination: PaginationState) {
  return useQuery({
    queryKey: ["users", pagination],
    queryFn: async () => {
      const response = await instance.get("/Users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        params: {
          limit: pagination.pageSize,
          skip: pagination.pageIndex * pagination.pageSize,
        },
      });
      return response.data;
    },
  });
}

export function useGetUserById(id: string) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      const response = await instance.get(`/Users/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    },
  });
}
