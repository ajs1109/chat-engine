import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown, LogOut, Mail, User } from "lucide-react";
import { Button } from "../ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useDispatch } from "react-redux";
import { authLogout } from "@/features/userSlice";
import { useLocation } from "react-router-dom";
import jwtDecode from "jwt-decode";

//http://localhost:5000/uploads/profilePic/1691581008065-zoro.jpg
type AvatarProps = {
  pic: string;
  name: string;
  email: string;
};
interface MyToken {
  email: string;
  _id: string;
  exp: number;
  // whatever else is in the JWT.
}
export function AvatarDemo({ pic, name, email }: AvatarProps) {
  const dispatch = useDispatch();

  const location = useLocation();

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("profile") || "")
  );

  const logOut = async () => {
    await dispatch(authLogout(user));
    window.location.assign("/");
    setUser("");
  };

  useEffect(() => {
    const token = user?.token;
    if (token) {
      const decodedToken = jwtDecode<MyToken>(token);
      if (decodedToken.exp * 1000 < new Date().getTime()) logOut();
    }
  }, [location]);
  return (
    <div className="">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="flex space-x-2 items-center hover:bg-slate-100 outline-none"
            variant="ghost"
          >
            <Avatar>
              <AvatarImage src={`http://localhost:5000/uploads/profilePicture/${pic}`} alt="@shadcn" />
              <AvatarFallback>{name[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <ChevronDown className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            {name}
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Mail className="mr-2 h-4 w-4" />
            {email}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logOut}>
            <LogOut className="mr-2 h-4 w-4" />
            logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
