import { authServices } from "@/services/authServices";
import { userServices } from "@/services/userServices";
import { useAuthStore } from "@/store/auth";
import type { Preferences, Profile, Wallet } from "@/types/authType";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useLoginMutation() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const updateUser = useAuthStore((state) => state.updateUser); // hàm update user, bạn thêm trong store

  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      authServices.login(data),

    onSuccess: async (response) => {
      // B1: lưu accessToken + info cơ bản ngay
      setAuth({
        user: {
          _id: response._id,
          name: response.name,
          email: response.email,
          phone: response.phone || null,
          avatar: response.avatar || null,
          role: response.role,
          isActive: response.isActive ?? true,
          isEmailVerified: response.isEmailVerified ?? false,
          isPhoneVerified: response.isPhoneVerified ?? false,
          createdAt: response.createdAt || undefined,
          updatedAt: response.updatedAt || undefined,
          // profile, wallet, preferences sẽ được fill sau
          profile: {} as Profile,
          wallet: {} as Wallet,
          preferences: {} as Preferences,
        },
        accessToken: response.accessToken,
      });

      try {
        // B2: gọi API lấy profile
        const profile = await userServices.getProfile();

        // B3: update user vào store
        updateUser({
          ...profile,
        });

        toast.success("Đăng nhập thành công");
      } catch (err) {
        toast.error(
          "Không lấy được thông tin profile",
          err instanceof Error ? { description: err.message } : undefined
        );
      }
    },
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (data: { name: string; email: string; password: string }) =>
      authServices.register(data),
    onSuccess: () => {
      toast.success("Đăng ký thành công!");
    },
  });
}
