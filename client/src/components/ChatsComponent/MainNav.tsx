import { Search,Bell } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import { AvatarDemo } from "./AvatarDemo";
import {SheetDemo} from '@/components/ChatsComponent/SearchUser'
interface MainNavProps {
    name:string;
    email:string;
    pic: string;
}

const MainNav: React.FC<MainNavProps> = ({pic,name,email}) => {
  return (
    <div className="sticky top-0 h-12 w-full bg-muted flex items-center justify-between">
      <SheetDemo/>
      <div className="heading my-auto">
        <h1 className="font-semibold text-lg tracking-wider ">ChatterBox</h1>
      </div>
      <div className="flex gap-4">
        <Bell className="my-auto" />
        <AvatarDemo name={name} pic={pic} email={email}  />
      </div>
    </div>
  );
};

export default MainNav;
