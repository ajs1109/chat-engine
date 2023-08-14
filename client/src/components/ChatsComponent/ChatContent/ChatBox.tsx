import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "@/axios/axios";
import { SendHorizonal } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { activeChatProps } from "@/features/activeChat";
import { Chat, User } from "@/features/chatSlice";
import MessageBox from "./MessageBox";
interface currentChatProps {
  activeChat: activeChatProps;
}

interface messageProps {
  chat: Chat;
  content: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  _id: string;
  sender: User;
}

const ChatBox = () => {

  const { result } = JSON.parse(localStorage.getItem("profile") || "")
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [activeMessages, setActiveMessages] = useState<messageProps[] | []>([]);
  const { activeChat } = useSelector(
    (state: currentChatProps) => state.activeChat
  );

 

  const sendMessage = async () => {};

  const activeChatMessage = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `/messages/getMessages/${activeChat?._id}`
      );
    
      setActiveMessages(data);
    } catch (err: any) {
      console.log(err.response.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    activeChatMessage();
  }, [activeMessages]);

  const handlePress = async (e: any) => {
    if (e.key === "Enter" && content.length > 0) {
      let chatId = activeChat?._id;
      await axios
        .post("/messages/sendMessage", { content, chatId })
        .then((res) => console.log(res))
        .catch((err) => console.log(err.response.data));
      setContent("");
    }
  };
  return (
    <div className="bg-slate-200 flex flex-col rounded-md w-full h-[620px] mt-auto">
      <div className="h-[620px] overflow-y-scroll no-scrollbar ">
        {activeMessages.length > 0 &&
          activeMessages.map((message: messageProps, index: number) => {
            if (
              index < activeMessages.length - 1 &&
              activeMessages[index].sender.email ===
                activeMessages[index + 1].sender.email
            ) {
              if (message.sender.email === result.email) {
                return (
                  <MessageBox
                    classs="flex flex-row-reverse direction-reverse gap-2 m-2 mr-14 items-center"
                    sender={message.sender}
                    content={message.content}
                    key={message._id}
                    pict="hidden"
                  />
                );
              } else {
                return (
                  <MessageBox
                    classs=" flex gap-2 ml-14 m-2 items-center"
                    sender={message.sender}
                    content={message.content}
                    key={message._id}
                    pict="hidden"
                  />
                );
              }
            } else {
              if (message.sender.email === result.email) {
                return (
                  <MessageBox
                    classs="flex flex-row-reverse direction-reverse gap-2 m-2 items-center"
                    sender={message.sender}
                    content={message.content}
                    key={message._id}
                    pict=""
                  />
                );
              } else {
                return (
                  <MessageBox
                    classs=" flex gap-2 m-2 items-center"
                    sender={message.sender}
                    content={message.content}
                    key={message._id}
                    pict=""
                  />
                );
              }
            }
          })}
      </div>
      <div className="flex gap-2 w-full relative">
        <Input
          className="m-2"
          placeholder="Send Message..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handlePress}
        />

        <SendHorizonal className="absolute bottom-4 right-6 z-10" />
      </div>
    </div>
  );
};

export default ChatBox;
