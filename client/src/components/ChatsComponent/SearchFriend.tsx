import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import axios from '@/axios/axios'
import { SheetClose } from "../ui/sheet";
type searchFriendProps = {
  name:string;
  email:string;
  pic:string;
  userId?:string;
}

const SearchFriend = ({name,email,pic,userId}:searchFriendProps) => {
  const accessChat = async () => {
    try{
      console.log(userId);
       const {data} = await axios.post("/chat/createChat",{userId})
       console.log(data)
    }catch(error:any){
      console.log(error.response);
    }
  }
  return (
    
      <SheetClose
        className="flex bg-slate-300 rounded-md my-2 hover:bg-slate-500 transition-all duration-100 cursor-pointer w-full"
        onClick={accessChat}
      >
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
      </SheetClose>
    
  );
};

export default SearchFriend;
