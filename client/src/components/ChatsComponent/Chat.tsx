import { activeChatProps } from "@/features/activeChat";
import { AlignJustify, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { GroupSettings } from "./ChatContent/GroupSettings";
import ChatBox from "./ChatContent/ChatBox";
import { Chat } from "@/features/chatSlice";
interface currentChatProps {
  activeChat: activeChatProps;
}

const ChatPage = () => {

  const { activeChat } = useSelector((state: currentChatProps) => {
    return state.activeChat;
  });
  const [groupSettings, setGroupSettings] = useState(false);
  const [display, setDisplay] = useState<Chat | null>(null);
  const isGroup = activeChat?.isGroupChat;
  //@ts-ignore
  const { result } = JSON.parse(localStorage.getItem("profile"));

  useEffect(() => {
    setDisplay(activeChat)
    
  }, [activeChat])
  
  return (
    <>
      {display ? (
        <div className="bg-slate-200 flex flex-col rounded-md px-2 basis-[100%] md:z-0 z-10 absolute w-full h-full md:relative ml-2 md:basis-[70%]">
          <div className="flex justify-between items-center mx-3 mt-2 font-mono tracking-wider">
            <div className="font-medium text-xs sm:text-3xl bg-slate-200 h-[50px] my-auto flex gap-2 items-center">
              <ArrowLeft
                className="items-center cursor-pointer"
                onClick={() => setDisplay(null)}
              />
              {isGroup
                ? activeChat.chatName
                : activeChat?.users[0].name === result.name
                ? activeChat?.users[1].name
                : activeChat?.users[0].name}
            </div>
            <AlignJustify
              className="h-6 w-6 duration-200 hover:text-white cursor-pointer"
              onClick={() => setGroupSettings(!groupSettings)}
            />
          </div>
          <div className="m-2">{groupSettings ? <GroupSettings /> : <ChatBox />}</div>
        </div>
      ) : (
        <div className="bg-slate-200 flex flex-col rounded-md px-2 basis-[100%] my-auto h-full items-center md:z-0 w-full md:relative ml-2 md:basis-[70%]">
          <div className="m-auto text-lg font-semibold tracking-wider hidden md:grid">
            Start a chat
          </div>
        </div>
      )}
    </>
  );
};

export default ChatPage;
