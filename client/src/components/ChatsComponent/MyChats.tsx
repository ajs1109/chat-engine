import React, { useEffect,useState } from "react";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import axios from "@/axios/axios";
import { useDispatch } from "react-redux";
import { chatsGetAll,Chat } from "@/features/chatSlice";
import { AvatarFallback,Avatar,AvatarImage } from "../ui/avatar";
import { SkeletonDemo } from "./SkeletonDemo";


const MyChats = () => {
  const [chats, setChats] = useState<Chat[] | null>(null); 
  //@ts-ignore
  const { result } = JSON.parse(localStorage.getItem("profile")); ;
  const name = result?.name;
  console.log(name)
  const dispatch=useDispatch()
  const getUsers = async () => {
    try {
      const {data} = await axios.get("/chat/fetchChats")
      setChats(data);
      console.log('fetch : ',chats)
      dispatch(chatsGetAll(data))
    } catch (err: any) {
      console.log(err.response.data);
    }
  };
  useEffect(() =>{
    getUsers();
  },[])

  return (
    <div className="basis-[30%] my-auto h-[700px] rounded-md bg-slate-200 p-2">
      <div className="flex justify-between items-center">
        <div className="text-lg font-mono">My Chats</div>
        <Button className="" variant="outline">
          New Group Chat <Plus className="ml-1 h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-col gap-2 mt-4">
        {!chats ? (
          <SkeletonDemo />
        ) : (
          chats?.map((item, index) => (
            <div className="bg-slate-300 rounded-md flex p-2" key={index}>
              <div>
                <Avatar className="m-auto">
                  <AvatarImage
                    src={`http://localhost:5000/uploads/profilePicture/${item.users[0].pic}`}
                    alt="@shadcn"
                  />
                  <AvatarFallback>
                    {item.users[0].name[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="ml-3 top-0 flex flex-col">
                <div className="text-sm">
                  {name == item.users[0].name
                    ? item.users[1].name
                    : item.users[0].name}
                </div>
                <div className="text-xs">latestMessage</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyChats;


