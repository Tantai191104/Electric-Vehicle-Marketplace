import { authServices } from "@/services/authServices";
import { useAuthStore } from "@/store/auth";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useLoginMutation() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      authServices.login(data),
    onSuccess: (response) => {
      const { user, accessToken } = response;

      // Lưu vào zustand (và sẽ tự động persist vào localStorage)
      setAuth({ user, accessToken });

      toast.success("Đăng nhập thành công");
    },
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (data: {
      name: string;
      email: string;
      password: string;
      phone: string;
    }) => authServices.register(data),
    onSuccess: () => {
      toast.success("Đăng ký thành công!");
    },
  });
}
