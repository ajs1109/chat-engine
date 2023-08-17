import axios from "@/axios/axios";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { activeChatProps } from "@/features/activeChat";
import { Chat, User } from "@/features/chatSlice";
import { SendHorizonal } from "lucide-react";
import React, { useEffect, useState } from "react";
import Lottie from "react-lottie-player";
import { useDispatch, useSelector } from "react-redux";
import io from "socket.io-client";
import typingg from "../../animations/typing.json";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
} from "./messageLogic";
import { commonDataProps, sendNotification } from "@/features/commonData";

export interface currentChatProps {
  activeChat: activeChatProps;
}

export interface messageProps {
  chat: Chat;
  content: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  _id: string;
  sender: User;
}

export interface newMessageReceivedProps {
  commonData: commonDataProps;
}

const ENDPOINT = "http://localhost:5000";

var socket: any, selectedChatCompare: any;

const ChatBox = () => {
  const dispatch = useDispatch();
  const { result } = JSON.parse(localStorage.getItem("profile") || "");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [activeMessages, setActiveMessages] = useState<messageProps[] | []>([]);
  const { activeChat } = useSelector(
    (state: currentChatProps) => state.activeChat
  );

  const { notificationData } = useSelector(
    (state: newMessageReceivedProps) => state.commonData
  );

  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", result);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
  });

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

      socket.emit("join chat", activeChat?._id);
    }
  };

  useEffect(() => {
    activeChatMessage();
    selectedChatCompare = activeChat;
  }, [activeChat]);

  useEffect(() => {
    socket.on(
      "message received",
      (newMessageReceived: messageProps) => {
        if (
          !selectedChatCompare ||
          selectedChatCompare._id !== newMessageReceived.chat._id
        ) {
          //give notification

          if (!notificationData?.includes(newMessageReceived)) {
            dispatch(sendNotification(newMessageReceived));
          }
        } else {
          setActiveMessages([...activeMessages, newMessageReceived]);
        }
      },
      []
    );
  });

  const handlePress = async (e: any) => {
    if (e.key === "Enter" && content.length > 0) {
      socket.emit("stop typing", activeChat?._id);
      let chatId = activeChat?._id;
      await axios
        .post("/messages/sendMessage", { content, chatId })
        .then((res) => {
          socket.emit("new message", res.data);
          setActiveMessages([...activeMessages, res.data]);
        })
        .catch((err) => console.log(err.response.data));
      setContent("");
    }
  };

  const typingHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
    if (!socketConnected) return;
    if (!typing) {
      setTyping(true);
      socket.emit("typing", activeChat?._id);
    }

    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", activeChat?._id);
        setTyping(false);
      }
    }, timerLength);
  };

  return (
    <div className=" flex flex-col-reverse rounded-md w-full h-[620px] bg-[#101b21]">
      <div className="flex gap-2 w-full relative">
        <Input
          style={{ backgroundColor: "#202d35" }}
          className="m-2 rounded-full text-[#b5babf]"
          placeholder="Send Message..."
          value={content}
          onChange={(e) => typingHandler(e)}
          onKeyDown={handlePress}
        />

        <Button className="bg-[#0071d9] absolute bottom-[9px] h-[38px] w-[38px] right-[9px] rounded-full">
          <SendHorizonal className="absolute left-[8px] z-10" />
        </Button>
      </div>

      <div className="h-[620px] overflow-auto no-scrollbar flex flex-col-reverse">
        {isTyping ? (
          <div className="w-fit ml-[60px] h-8 bg-[#0071d9] text-[#b5babf] rounded-full px-2 pt-[2px] m-2">
            <Lottie loop animationData={typingg} play className="w-12" />
          </div>
        ) : (
          <></>
        )}
        {activeMessages.length > 0 &&
          activeMessages
            .slice(0)
            .reverse()
            .map((message: messageProps, index: number) => (
              <div className="flex space-x-1 items-center" key={index}>
                {(isSameSender(activeMessages, message, index, result._id) ||
                  isLastMessage(activeMessages, index, result._id)) && (
                  <Avatar className="ml-4 h-8 w-8 mr-2">
                    <AvatarImage
                      src={`http://localhost:5000/uploads/profilePicture/${message.sender.pic}`}
                      alt="@shadcn"
                    />
                    <AvatarFallback>
                      {message.sender.name[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className="bg-[#0071d9] text-[#ffffff] min-w-[30px] rounded-full px-2 pt-[2px] h-8 m-2"
                  style={{
                    marginLeft: isSameSenderMargin(
                      activeMessages,
                      message,
                      index,
                      result._id
                    ),
                  }}
                >
                  {message.content}
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};

export default ChatBox;

// {
//               if (
//                 index > 0 &&
//                 activeMessages[index].sender.email ===
//                   activeMessages[index - 1].sender.email
//               ) {
//                 if (message.sender.email === result.email) {
//                   return (
//                     <MessageBox
//                       classs="flex flex-row-reverse direction-reverse gap-2 m-2 mr-14 items-center "
//                       sender={message.sender}
//                       content={message.content}
//                       key={message._id}
//                       pict="hidden"
//                     />
//                   );
//                 } else {
//                   return (
//                     <MessageBox
//                       classs=" flex gap-2 ml-14 m-2 items-center "
//                       sender={message.sender}
//                       content={message.content}
//                       key={message._id}
//                       pict="hidden"
//                     />
//                   );
//                 }
//               } else {
//                 if (message.sender.email === result.email) {
//                   return (
//                     <MessageBox
//                       classs="flex flex-row-reverse direction-reverse gap-2 m-2 items-center "
//                       sender={message.sender}
//                       content={message.content}
//                       key={message._id}
//                       pict=""
//                     />
//                   );
//                 } else {
//                   return (
//                     <MessageBox
//                       classs=" flex gap-2 m-2 items-center"
//                       sender={message.sender}
//                       content={message.content}
//                       key={message._id}
//                       pict=""
//                     />
//                   );
//                 }
//               }
//             }
