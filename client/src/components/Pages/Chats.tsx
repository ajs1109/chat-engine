import { authSignin } from "@/features/userSlice";
import { getStoredProfile } from "@/lib/profile";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import Chat from "../ChatsComponent/Chat";
import MainNav from "../ChatsComponent/MainNav";
import MyChats from "../ChatsComponent/MyChats";

const Chats = () => {
  const dispatch = useDispatch();
  const user = getStoredProfile();

  useEffect(() => {
    if (user.result && user.token) {
      dispatch(authSignin({ result: user.result, token: user.token }));
    }
  }, [dispatch, user.result, user.token]);

  return (
    <div className="flex flex-col h-[100vh] bg-[#B9D0E9] w-full text-[#0E2239]">
      <MainNav name={user?.result?.name || ""} email={user?.result?.email || ""} pic={user?.result?.pic || ""} />
      <div className="sm:mx-3 flex flex-col relative md:flex-row h-full mt-4">
        <MyChats />
        <Chat />
      </div>
    </div>
  );
};

export default Chats;
