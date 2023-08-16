import { SheetDemo } from '@/components/ChatsComponent/SearchUser';
import { Bell } from "lucide-react";
import React from "react";
import { AvatarDemo } from "./AvatarDemo";
interface MainNavProps {
    name:string;
    email:string;
    pic: string;
}

const MainNav: React.FC<MainNavProps> = ({pic,name,email}) => {
  return (
    <div className="sticky top-0 h-12 w-full  flex items-center justify-between bg-[#B9D0E9] ">
      <SheetDemo />
      <div className="heading my-auto">
        <h1 className="font-semibold text-lg tracking-wider text-[#0E2239]">
          ChatterBox
        </h1>
      </div>
      <div className="flex gap-4">
        <Bell className="my-auto" />
        <AvatarDemo name={name} pic={pic} email={email} />
      </div>
    </div>
  );
};

export default MainNav;
