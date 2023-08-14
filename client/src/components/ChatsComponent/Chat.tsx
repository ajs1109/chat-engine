import { activeChatProps } from "@/features/activeChat";
import { AlignJustify } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { GroupSettings } from "./ChatContent/GroupSettings";
import ChatBox from "./ChatContent/ChatBox";
interface currentChatProps {
  activeChat: activeChatProps ;
}

const Chat = () => {
  const { activeChat } = useSelector((state:currentChatProps) => state.activeChat);
  const [groupSettings, setGroupSettings] = useState(false);
  const isGroup = activeChat?.isGroupChat;

  return (
    <div className="bg-slate-200 flex flex-col rounded-md ml-2 basis-[100%] lg:basis-[70%] ">
      <div className="flex justify-between items-center mx-3 mt-2 font-mono tracking-wider">
        <div className="font-medium text-xs sm:text-3xl sticky bg-slate-200 z-10 h-[50px] items-center">
          {isGroup ? activeChat.chatName : "ChatName"}
        </div>
        <AlignJustify 
        className="h-6 w-6 duration-200 hover:text-white cursor-pointer"
        onClick={() => setGroupSettings(!groupSettings)}
        />
      </div>
      {groupSettings ? <GroupSettings /> : <ChatBox />}
    </div>
  )
};

export default Chat;
