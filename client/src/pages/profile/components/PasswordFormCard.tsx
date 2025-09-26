// components/PasswordFormCard.tsx
import React from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CardFormRow from "./CardFormRow";

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type PasswordFormCardProps = {
  form: ReturnType<typeof useForm<PasswordForm>>;
  onSubmit: SubmitHandler<PasswordForm>;
};

const PasswordFormCard: React.FC<PasswordFormCardProps> = ({
  form,
  onSubmit,
}) => (
  <Card className="shadow-md rounded-xl bg-white">
    <CardHeader>
      <CardTitle>Đổi mật khẩu</CardTitle>
      <CardDescription>Đặt mật khẩu mới cho tài khoản của bạn</CardDescription>
    </CardHeader>
    <CardContent className="mt-2">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <CardFormRow
          label="Mật khẩu hiện tại"
          error={form.formState.errors.currentPassword?.message}
        >
          <Input type="password" {...form.register("currentPassword")} />
        </CardFormRow>
        <CardFormRow
          label="Mật khẩu mới"
          error={form.formState.errors.newPassword?.message}
        >
          <Input type="password" {...form.register("newPassword")} />
        </CardFormRow>
        <CardFormRow
          label="Xác nhận mật khẩu"
          error={form.formState.errors.confirmPassword?.message}
        >
          <Input type="password" {...form.register("confirmPassword")} />
        </CardFormRow>
        <div className="flex justify-end">
          <Button
            type="submit"
            className="bg-yellow-400 hover:bg-yellow-500 text-white"
          >
            Cập nhật mật khẩu
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>
);

export default PasswordFormCard;
