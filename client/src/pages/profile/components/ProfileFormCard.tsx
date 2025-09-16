// components/ProfileFormCard.tsx
import React from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CardFormRow from "./CardFormRow";

type ProfileForm = {
  name: string;
  email: string;
  phone: string;
};

type ProfileFormCardProps = {
  form: ReturnType<typeof useForm<ProfileForm>>;
  onSubmit: SubmitHandler<ProfileForm>;
};

const ProfileFormCard: React.FC<ProfileFormCardProps> = ({ form, onSubmit }) => (
  <Card className="shadow-md rounded-xl bg-white">
    <CardHeader>
      <CardTitle>Thông tin cá nhân</CardTitle>
      <CardDescription>Cập nhật thông tin cá nhân của bạn</CardDescription>
    </CardHeader>
    <CardContent className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
      <form onSubmit={form.handleSubmit(onSubmit)} className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-4">
        <CardFormRow label="Tên" error={form.formState.errors.name?.message}>
          <Input {...form.register("name")} />
        </CardFormRow>
        <CardFormRow label="Email" error={form.formState.errors.email?.message}>
          <Input type="email" {...form.register("email")} />
        </CardFormRow>
        <CardFormRow label="Số điện thoại" error={form.formState.errors.phone?.message}>
          <Input {...form.register("phone")} />
        </CardFormRow>
        <div className="flex items-end">
          <Button type="submit" className="bg-yellow-400 hover:bg-yellow-500 text-white">
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>
);

export default ProfileFormCard;
