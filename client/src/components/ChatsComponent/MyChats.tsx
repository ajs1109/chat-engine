import axios from "@/axios/axios";
import { setActiveChat } from "@/features/activeChat";
import { Chat, chatsGetAll } from "@/features/chatSlice";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { DialogDemo } from "./NewGroupChat";
import { UserCardSkeleton } from "./UserCardSkeleton";

const MyChats = () => {
  const [groupCreated, setGroupCreated] = useState(false);
  const [chats, setChats] = useState<Chat[] | []>([]);
  const [loading,setLoading] = useState(true);
  //@ts-ignore
  const { result } = JSON.parse(localStorage.getItem("profile"));
  const name = result?.name;
  const dispatch = useDispatch();
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/chat/fetchChats");
      setChats(data);
      dispatch(chatsGetAll(data));
    } catch (err: any) {
      console.log(err.response.data);
    }
    finally{
      setLoading(false);
    }
  };
  useEffect(() => {
    getUsers();
  }, [groupCreated,
    chats
  ]);

  const handleActiveChat = (item: Chat) => {
    console.log(item);
    dispatch(setActiveChat(item));
  };

  return (
    <div className="md:basis-[30%] max-w-full sm:min-w-[300px] my-auto h-full md:h-[680px] flex flex-col rounded-md bg-slate-200 p-2">
      <div className="flex justify-between items-center">
        <div className="text-lg font-mono">My Chats</div>
        <DialogDemo
          setGroupCreated={setGroupCreated}
          groupCreated={groupCreated}
        />
      </div>
      <div className="flex flex-col gap-2 mt-4 overflow-auto no-scrollbar">
        { !loading ? chats.map((item, index) =>
          item.isGroupChat ? (
            <div
              className="bg-slate-300 hover:bg-slate-400 rounded-md flex p-2 cursor-pointer"
              key={index}
              onClick={() => handleActiveChat(item)}
            >
              <div>
                <Avatar className="ml-2">
                  <AvatarImage src="" alt="@shadcn" />
                  <AvatarFallback>
                    {item.chatName[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="ml-3 top-0 flex flex-col">
                <div className="text-sm font-semibold tracking-wide">
                  {item.chatName}
                </div>
                {item.latestMessage?.content ? (
                  <div className="text-xs">
                    {`${item.latestMessage.sender.name} : ${item.latestMessage?.content}`
                      .length > 40
                      ? `${item.latestMessage.sender.name} : ${item.latestMessage?.content}`.substring(
                          0,
                          40
                        ) + "..."
                      : `${item.latestMessage.sender.name} : ${item.latestMessage?.content}`}
                  </div>
                ) : (
                  <div className="text-xs">Start a chat</div>
                )}
              </div>
            </div>
          ) : (
            <div
              className="bg-slate-300 h-14 items-center hover:bg-slate-400 rounded-md flex p-2 cursor-pointer"
              key={index}
              onClick={() => handleActiveChat(item)}
            >
              <div>
                <Avatar className="ml-2">
                  <AvatarImage
                    src={
                      name === item.users[0].name
                        ? `http://localhost:5000/uploads/profilePicture/${item.users[1].pic}`
                        : `http://localhost:5000/uploads/profilePicture/${item.users[0].pic}`
                    }
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
                <div className="text-xs">
                  {item.latestMessage?.content ? (
                    <div className="text-xs">
                      {item.latestMessage?.content.length > 40
                        ? `${item.latestMessage?.content}`.substring(
                            0,
                            40
                          ) + "..."
                        : item.latestMessage?.content}
                    </div>
                  ) : (
                    <div className="text-xs">Start a chat</div>
                  )}
                </div>
              </div>
            </div>
          )
        ) :<UserCardSkeleton/>  }
      </div>
    </div>
  );
};

export default MyChats;
