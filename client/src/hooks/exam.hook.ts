import { useMutation, useQuery } from "@tanstack/react-query";
import { instance } from "../libs/axios";
import { toast } from "react-toastify";
import { PaginationState } from "@tanstack/react-table";

export function useSetResult(id: string) {
  return useMutation({
    mutationFn: async (data: {
      [userId: string]: {
        [category: string]: string;
      };
    }) => {
      const response = await instance.post(
        `/Examinations/${id}/setResults`,
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

export function useGetAllExaminations(pagination: PaginationState) {
  return useQuery({
    queryKey: ["examinations", pagination],
    queryFn: async () => {
      const response = await instance.get("/Examinations", {
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

export function useGetExaminationById(id: string) {
  return useQuery({
    queryKey: ["examination", id],
    queryFn: async () => {
      const response = await instance.get(`/Examinations/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const participants = await instance.get(
        `/Examinations/${id}/participants`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      response.data.participants = participants.data;
      return response.data;
    },
  });
}
