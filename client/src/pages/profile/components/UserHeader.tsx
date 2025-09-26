// components/UserHeader.tsx
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type UserHeaderProps = {
  name: string;
  role: string;
  avatarSrc?: string;
};

const UserHeader: React.FC<UserHeaderProps> = ({ name, role, avatarSrc }) => (
  <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 mb-4">
    <Avatar className="w-14 h-14">
      <AvatarImage src={avatarSrc || "/vite.svg"} alt={name} />
      <AvatarFallback>CT</AvatarFallback>
    </Avatar>
    <div>
      <h2 className="text-xl font-bold text-yellow-900">{name}</h2>
      <p className="text-yellow-800 font-medium text-sm">{role}</p>
    </div>
  </div>
);

export default UserHeader;
