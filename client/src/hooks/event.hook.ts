import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { PaginationState } from "@tanstack/react-table";
import { toast } from "react-toastify";
import { instance } from "../libs/axios";

export function useGetAllEvents(pagination: PaginationState, filter?: any) {
  return useQuery({
    queryKey: ["events", filter, pagination],
    queryFn: async () => {
      const response = await instance.get("/Events", {
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

export function useCreateEvent() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await instance.post(`/Events`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    },
    onSuccess() {
      toast.success("Event created successfully", {
        autoClose: 2000,
        onClose: () => {
          navigate({ to: `/events` });
        },
      });
    },
    onError(error) {
      toast.error(error.message);
    },
  });
}

export function useGetBranchOptions() {
  return useQuery({
    queryKey: ["branchOptions"],
    queryFn: async () => {
      const response = await instance.get("/Branch", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data.map((branch: any) => ({
        id: branch.id,
        name: branch.name,
      }));
    },
  });
}

export function useDeleteEvent() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await instance.delete(`/Events/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    },
    onSuccess() {
      toast.success("Event deleted successfully", {
        autoClose: 2000,
        onClose: () => {
          window.location.reload();
        },
      });
    },
    onError(error) {
      toast.error(error.message);
    },
  });
}
