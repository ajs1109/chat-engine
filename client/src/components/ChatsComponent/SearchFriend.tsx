import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

type searchFriendProps = {
  name:string;
  email:string;
  pic:string;
  _id?:string;
}

const SearchFriend = ({name,email,pic}:searchFriendProps) => {
  return (
    <div className="flex bg-slate-200 rounded-md my-2 ">
      <Avatar className="m-2">
        <AvatarImage
            src={`http://localhost:5000/uploads/profilePicture/${pic}`}
          alt="@shadcn"
        />
        <AvatarFallback>{`${name[0].toUpperCase()}`}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col justify-evenly">
        <div className="text-sm">{name}</div>
        <div className="text-sm">Email : {email}</div>
      </div>
    </div>
  );
};

export default SearchFriend;
