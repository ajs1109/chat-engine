import { authSignin } from "@/features/userSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Chat from "../ChatsComponent/Chat";
import MainNav from "../ChatsComponent/MainNav";
import MyChats from "../ChatsComponent/MyChats";
import { SkeletonDemo } from "../ChatsComponent/SkeletonDemo";

const Chats = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = JSON.parse(localStorage.getItem("profile") || "{}");

  useEffect(() => {
    dispatch(authSignin(user));
  }, []);
  console.log("user : ", user);

  return (
    <div className="flex flex-col">
      <MainNav
        name={user?.result?.name}
        email={user?.result?.email}
        pic={user?.result?.pic}
      />
      <div className="sm:mx-3 sm:flex sm:gap-2">
        <MyChats />
        <Chat />
        
      </div>
    </div>
  );
};

export default Chats;
