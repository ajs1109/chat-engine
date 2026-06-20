import axios from "@/axios/axios";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { activeChatProps } from "@/features/activeChat";
import { commonDataProps, sendNotification } from "@/features/commonData";
import { Chat, User } from "@/features/chatSlice";
import { getProfileImageUrl, SOCKET_URL } from "@/lib/config";
import { getStoredProfile } from "@/lib/profile";
import { SendHorizonal } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import Lottie from "react-lottie-player";
import { useDispatch, useSelector } from "react-redux";
import { Socket, io } from "socket.io-client";
import typingg from "../../animations/typing.json";
import { isLastMessage, isSameSender, isSameSenderMargin } from "./messageLogic";

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

const ChatBox = () => {
  const dispatch = useDispatch();
  const { result } = getStoredProfile();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [activeMessages, setActiveMessages] = useState<messageProps[]>([]);
  const { activeChat } = useSelector((state: currentChatProps) => state.activeChat);
  const { notificationData } = useSelector((state: newMessageReceivedProps) => state.commonData);

  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const selectedChatIdRef = useRef<string | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  const loadActiveChatMessages = useCallback(async () => {
    if (!activeChat?._id) {
      setActiveMessages([]);
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.get(`/messages/getMessages/${activeChat._id}`);
      setActiveMessages(data);
      selectedChatIdRef.current = activeChat._id;
      socketRef.current?.emit("join chat", activeChat._id);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [activeChat?._id]);

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.emit("setup", result);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    const onMessageReceived = (newMessageReceived: messageProps) => {
      if (selectedChatIdRef.current !== newMessageReceived.chat._id) {
        const hasNotification = notificationData?.some(
          (notification) => notification._id === newMessageReceived._id
        );
        if (!hasNotification) {
          dispatch(sendNotification(newMessageReceived));
        }
      } else {
        setActiveMessages((prev) => [...prev, newMessageReceived]);
      }
    };

    socket.on("message received", onMessageReceived);

    return () => {
      socket.off("connected");
      socket.off("typing");
      socket.off("stop typing");
      socket.off("message received", onMessageReceived);
      socket.disconnect();
    };
  }, [dispatch, notificationData, result]);

  useEffect(() => {
    loadActiveChatMessages();
  }, [loadActiveChatMessages]);

  const sendMessage = async () => {
    if (!activeChat?._id || content.trim().length === 0) {
      return;
    }

    try {
      socketRef.current?.emit("stop typing", activeChat._id);
      const chatId = activeChat._id;
      const { data } = await axios.post("/messages/sendMessage", {
        content: content.trim(),
        chatId,
      });
      socketRef.current?.emit("new message", data);
      setActiveMessages((prev) => [...prev, data]);
      setContent("");
    } catch (err) {
      console.log(err);
    }
  };

  const handlePress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      void sendMessage();
    }
  };

  const typingHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
    if (!socketConnected || !activeChat?._id) {
      return;
    }

    if (!typing) {
      setTyping(true);
      socketRef.current?.emit("typing", activeChat._id);
    }

    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = window.setTimeout(() => {
      if (typing) {
        socketRef.current?.emit("stop typing", activeChat._id);
        setTyping(false);
      }
    }, 3000);
  };

  return !loading ? (
    <div className="flex flex-col-reverse rounded-md z-10 w-full h-[620px] bg-[#101b21]">
      <div className="flex gap-2 w-full relative">
        <Input
          style={{ backgroundColor: "#202d35" }}
          className="m-2 rounded-full text-[#b5babf]"
          placeholder="Send Message..."
          value={content}
          onChange={typingHandler}
          onKeyDown={handlePress}
        />

        <Button
          className="bg-[#0071d9] absolute bottom-[9px] h-[38px] w-[38px] right-[9px] rounded-full"
          onClick={() => {
            void sendMessage();
          }}
        >
          <SendHorizonal className="absolute left-[8px] z-10" />
        </Button>
      </div>
      <div className="h-[620px] flex flex-col no-scrollbar">
        {activeMessages.map((message, index) => (
          <div className="flex space-x-1 items-center" key={message._id}>
            {(isSameSender(activeMessages, message, index, result?._id || "") ||
              isLastMessage(activeMessages, index, result?._id || "")) && (
              <Avatar className="ml-4 h-8 w-8 mr-2">
                <AvatarImage src={getProfileImageUrl(message.sender.pic)} alt="profile" />
                <AvatarFallback>{message.sender.name[0].toUpperCase()}</AvatarFallback>
              </Avatar>
            )}
            <div
              className="bg-[#0071d9] text-justify max-w-[50%] text-[#ffffff] min-w-[30px] rounded-lg py-auto px-2 pt-[0px] h-fit m-2"
              style={{
                marginLeft: isSameSenderMargin(
                  activeMessages,
                  message,
                  index,
                  result?._id || ""
                ),
              }}
            >
              <p className="max-w-full break-all">{message.content}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="w-fit ml-[60px] h-8 bg-[#0071d9] text-[#b5babf] rounded-xl px-2 pt-[2px] m-2">
            <Lottie loop animationData={typingg} play className="w-12" />
          </div>
        )}
      </div>
    </div>
  ) : (
    <div className="flex flex-col-reverse rounded-md z-10 w-full h-[620px] bg-[#101b21]"></div>
  );
};

export default ChatBox;

