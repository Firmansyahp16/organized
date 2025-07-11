import { useMutation, useQuery } from "@tanstack/react-query";
import { instance } from "../libs/axios";
import _ from "lodash";
import { toast } from "react-toastify";
import { PaginationState } from "@tanstack/react-table";
import { useNavigate } from "@tanstack/react-router";

export function useGetAllBranches(pagination: PaginationState, filter?: any) {
  return useQuery({
    queryKey: ["branches", filter, pagination],
    queryFn: async () => {
      const branchFilter = _.pickBy(
        filter,
        (value) =>
          value !== "" &&
          value !== undefined &&
          value !== null &&
          (typeof value !== "boolean" || value)
      );
      const response = await instance.get("/Branch", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        params: {
          filter: {
            where: branchFilter,
            // include: ["members"],
          },
          limit: pagination.pageSize,
          skip: pagination.pageIndex * pagination.pageSize,
        },
      });
      return response.data;
    },
  });
}

export function useGetBranchById(id: string) {
  return useQuery({
    queryKey: ["branch", id],
    queryFn: async () => {
      const response = await instance.get(`/Branch/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const members = await instance.get(`/Branch/${id}/members`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const branchData = response.data;
      const scheduleResponse = await instance.get("/Schedules", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        params: {
          filter: {
            where: {
              branchId: id,
            },
            include: ["attendances"],
          },
        },
      });
      const examResponse = await instance.get("/Examinations", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        params: {
          filter: {
            where: {
              branchIds: {
                inq: [id],
              },
            },
          },
        },
      });
      const coachesResponse = await instance.get(`/Branch/${id}/coaches`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const usersRespones = await instance.get("/Users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        params: {
          filter: {
            where: {
              globalRoles: {
                inq: ["unassignedCoach"],
              },
            },
          },
        },
      });
      branchData.coachOptions = [
        ...coachesResponse.data.map((c: any) => {
          return {
            label: c.fullName,
            value: c.id,
          };
        }),
        ...usersRespones.data.map((c: any) => {
          return {
            label: c.fullName,
            value: c.id,
          };
        }),
      ];
      branchData.members = members.data;
      branchData.coaches = coachesResponse.data;
      branchData.schedules = scheduleResponse.data ?? [];
      branchData.examinations = examResponse.data ?? [];
      return branchData;
    },
  });
}

export function useSetCoaches(id: string) {
  return useMutation({
    mutationFn: async ({ coachIds }: { coachIds: string[] }) => {
      const response = await instance.post(
        `/Branch/${id}/setCoach`,
        { coachIds },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data;
    },
    onSuccess() {
      toast.success("Coaches set successfully", {
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

export function useSetSchedule(id: string) {
  return useMutation({
    mutationFn: async (data: {
      count: number;
      startDate: string;
      resetSchedule: boolean;
    }) => {
      const response = await instance.post(`/Branch/${id}/setSchedule`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    },
    onSuccess() {
      toast.success("Schedule set successfully", {
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

export function useSetExamination(id: string) {
  return useMutation({
    mutationFn: async (data: {
      title: string;
      date: string;
      branchIds: string[];
      examiners: string[];
    }) => {
      const response = await instance.post(`/Branch/${id}/setExam`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    },
    onSuccess() {
      toast.success("Examination set successfully", {
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

export function useSetParticipants(id: string) {
  return useMutation({
    mutationFn: async (data: {
      auto: boolean;
      participants?: {
        [branchId: string]: string[];
      };
    }) => {
      const response = await instance.post(
        `/Examinations/${id}/setParticipants`,
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
      toast.success("Participants set successfully", {
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

export function useEditBranch(id: string) {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (data: { name: string }) => {
      const response = await instance.patch(`/Branch/${id}`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    },
    onSuccess() {
      toast.success("Branch edited successfully", {
        autoClose: 2000,
        onClose: () => {
          navigate({ to: `/branch/${id}` });
        },
      });
    },
    onError(error) {
      toast.error(error.message);
    },
  });
}

export function useCreateBranch() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (data: { name: string }) => {
      const response = await instance.post(`/Branch`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    },
    onSuccess() {
      toast.success("Branch created successfully", {
        autoClose: 2000,
        onClose: () => {
          navigate({ to: `/branch` });
        },
      });
    },
    onError(error) {
      toast.error(error.message);
    },
  });
}

export function useDeleteBranch() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await instance.delete(`/Branch/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    },
    onSuccess() {
      toast.success("Branch deleted successfully", {
        autoClose: 2000,
        onClose: () => {
          if (window.location.pathname.startsWith("/branch")) {
            window.location.reload();
          } else {
            navigate({ to: `/branch` });
          }
        },
      });
    },
    onError(error) {
      toast.error(error.message);
    },
  });
}
