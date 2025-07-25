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

export function useGetEventById(id: string) {
  return useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const response = await instance.get(`/Events/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        params: {
          filter: {
            include: ["attendances"],
          },
        },
      });
      return response.data;
    },
  });
}

export function useGetBranchParticipated(id: string) {
  return useQuery({
    queryKey: ["branchParticipated", id],
    queryFn: async () => {
      const response = await instance.get(`/Events/${id}/branchParticipated`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    },
  });
}

export function useSetParticipant(id: string) {
  return useMutation({
    mutationFn: async (data: {
      participants: {
        id: string;
        rank: string;
      }[];
    }) => {
      const response = await instance.post(
        `/Events/${id}/setParticipants`,
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
      toast.success("Participant set successfully", {
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

export function useSetAttendance(id: string) {
  return useMutation({
    mutationFn: async (data: { id: string; status: string }[]) => {
      const response = await instance.post(
        `/Events/${id}/setAttendance`,
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

export function useSetResult(id: string) {
  return useMutation({
    mutationFn: async (data: {
      [userId: string]: {
        kihon: string;
        kata: string;
        kumite: string;
      };
    }) => {
      const response = await instance.post(`/Events/${id}/setResults`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    },
    onSuccess() {
      toast.success("Result set successfully", {
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
