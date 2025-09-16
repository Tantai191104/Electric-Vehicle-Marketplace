// components/UserHeader.tsx
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type UserHeaderProps = {
  name: string;
  role: string;
  avatarSrc?: string;
};

const UserHeader: React.FC<UserHeaderProps> = ({ name, role, avatarSrc }) => (
  <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12 mb-6">
    <Avatar className="w-28 h-28">
      <AvatarImage src={avatarSrc || "/vite.svg"} alt={name} />
      <AvatarFallback>CT</AvatarFallback>
    </Avatar>
    <div>
      <h2 className="text-3xl font-bold text-yellow-900">{name}</h2>
      <p className="text-yellow-800 font-medium">{role}</p>
    </div>
  </div>
);

export default UserHeader;
