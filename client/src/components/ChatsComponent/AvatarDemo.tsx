import { authLogout } from "@/features/userSlice";
import { getProfileImageUrl } from "@/lib/config";
import { getStoredProfile } from "@/lib/profile";
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
import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import jwtDecode from "jwt-decode";

type AvatarProps = {
  pic: string;
  name: string;
  email: string;
};

interface MyToken {
  email: string;
  _id: string;
  exp: number;
}

export function AvatarDemo({ pic, name, email }: AvatarProps) {
  const dispatch = useDispatch();
  const location = useLocation();
  const user = getStoredProfile();

  const logOut = useCallback(() => {
    dispatch(authLogout());
    window.location.assign("/");
  }, [dispatch]);

  useEffect(() => {
    const token = user?.token;
    if (token) {
      const decodedToken = jwtDecode<MyToken>(token);
      if (decodedToken.exp * 1000 < Date.now()) {
        logOut();
      }
    }
  }, [location, logOut, user?.token]);

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="flex space-x-2 items-center hover:bg-slate-100 outline-none"
            variant="ghost"
          >
            <Avatar>
              <AvatarImage src={getProfileImageUrl(pic)} alt="profile" />
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

