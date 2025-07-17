import { useMutation, useQuery } from "@tanstack/react-query";
import { PaginationState } from "@tanstack/react-table";
import { toast } from "react-toastify";
import { instance } from "../libs/axios";

export function useSetAttendance(id: string) {
  return useMutation({
    mutationFn: async (data: { id: string; status: string }[]) => {
      const response = await instance.post(
        `/Schedules/${id}/setAttendance`,
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data;
    },
    onSuccess() {
      toast.success("Attendances set successfully", {
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

export function useGetAllSchedules(pagination: PaginationState) {
  return useQuery({
    queryKey: ["schedules", pagination],
    queryFn: async () => {
      const response = await instance.get("/Schedules", {
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

export function useDeleteSchedule() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await instance.delete(`/Schedules/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    },
    onSuccess() {
      toast.success("Schedule deleted successfully", {
        autoClose: 2000,
        onOpen: () => {
          window.location.reload();
        },
      });
    },
    onError(error) {
      toast.error(error.message);
    },
  });
}

export function useGetScheduleById(id: string) {
  return useQuery({
    queryKey: ["schedule", id],
    queryFn: async () => {
      const response = await instance.get(`/Schedules/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    },
  });
}

export function useEditSchedule(id: string) {
  return useMutation({
    mutationFn: async (data: { title: string; date: string }) => {
      const response = await instance.patch(`/Schedules/${id}`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    },
    onSuccess() {
      toast.success("Schedule edited successfully", {
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

export function useSetMaterial() {
  return useMutation({
    mutationFn: async (data: { id: string; material: string }) => {
      const response = await instance.post(
        `/Schedules/${data.id}/setMaterial`,
        {
          material: data.material,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data;
    },
    onSuccess() {
      toast.success("Material set successfully", {
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
