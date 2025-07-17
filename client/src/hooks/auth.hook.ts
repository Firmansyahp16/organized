import { useMutation } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import { instance } from "../libs/axios";

export function useLogin() {
  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const response = await instance.post("/Users/login", { email, password });
      const decode = jwtDecode<any>(response.data.token);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "expiredAt",
        (Number(response.data.ttl) * 1000 + new Date().getTime()).toString()
      );
      localStorage.setItem("email", decode.email);
      localStorage.setItem("userId", decode.id);
      return response.data;
    },
    onSuccess() {
      toast.success("Login successful", {
        autoClose: 2000,
        onClose: () => {
          window.location.href = "/";
        },
      });
    },
    onError(error) {
      toast.error(error.message);
    },
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      localStorage.removeItem("token");
      localStorage.removeItem("expiredAt");
      localStorage.removeItem("email");
      localStorage.removeItem("userId");
    },
    onSuccess() {
      toast.success("Logout successful", {
        autoClose: 2000,
        onClose: () => {
          window.location.href = "/";
        },
      });
    },
    onError(error) {
      toast.error(error.message);
    },
  });
}

export function useRefresh() {
  return useMutation({
    mutationFn: async () => {
      const response = await instance.post("/Users/refresh", {
        refreshToken: localStorage.getItem("token"),
      });
      const decode = jwtDecode<any>(response.data.token);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "expiredAt",
        (Number(response.data.ttl) * 1000 + new Date().getTime()).toString()
      );
      localStorage.setItem("email", decode.email);
      localStorage.setItem("userId", decode.id);
      return response.data;
    },
    onSuccess() {
      toast.success("Refresh successful", {
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
