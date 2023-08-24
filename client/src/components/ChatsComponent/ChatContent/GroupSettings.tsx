import {
  activeChatProps,
  deleteUser,
  renameGroup,
  setActiveChat,
} from "@/features/activeChat";
import { User, deleteUserFromGroup, editChatName } from "@/features/chatSlice";
import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "@/axios/axios";
import { toast } from "react-hot-toast";
import { AlertModal } from "@/components/Pages/modals/alertModal";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { GroupUser } from "../GroupUsers";

interface currentChatProps {
  activeChat: activeChatProps;
}

export const GroupSettings = () => {
  const dispatch = useDispatch();
  const { activeChat } = useSelector(
    (state: currentChatProps) => state.activeChat
  );

  const currentUser: User = JSON.parse(localStorage.getItem("profile") || "");

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  setLoading(false);

  const [name, setName] = useState(activeChat?.chatName);
  const [deletedUser, setDeletedUser] = useState<User | null>(null);
  useMemo(async () => {
    if (deletedUser) {
      let putData = {
        chatId: activeChat?._id,
        userId: deletedUser?._id,
      };

      const { data } = await axios.put("/chat/removeFromGroup", putData);
      if (deletedUser) {
        dispatch(deleteUser(deletedUser));
        dispatch(deleteUserFromGroup(data));
        toast("Name Updated!", {
          icon: "👏",
          style: {
            borderRadius: "10px",
            background: "0a0a0a",
            color: "#ffffff",
          },
        });
      }
    }
  }, [deletedUser]);

  const LeaveGroup = async () => {
    try {
      // const chatId = activeChat?._id;
      const { data } = await axios.put("/chat/deleteGroup", { activeChat });
      console.log(data);
      setOpen(false);
      dispatch(setActiveChat(null));
      toast("Group Leaved!", {
        icon: "👏",
        style: {
          borderRadius: "10px",
          background: "0a0a0a",
          color: "#ffffff",
        },
      });
    } catch (err: any) {
      console.log(err);
    }
  };

  const handleName = async () => {
    try {
      let putData = {
        chatId: activeChat?._id,
        chatName: name,
      };
      const { data } = await axios.put("/chat/renameGroup", putData);
      if (data) {
        toast("Name Updated!", {
          icon: "👏",
          style: {
            borderRadius: "10px",
            background: "0a0a0a",
            color: "#ffffff",
          },
        });
        dispatch(renameGroup(data.chatName));
        dispatch(editChatName(data));
      }
    } catch (err: any) {
      console.log(err.response.data);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <AlertModal
        title="Are you sure you want to leave the group?"
        description=""
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={LeaveGroup}
        loading={loading}
      />
      <div className="bg-white flex flex-col rounded-md mt-2 w-full max-h-full">
        <div className="flex justify-between mx-2 items-center">
          <span className="text-2xl font-sans font-medium mt-2">
            Group Settings
          </span>
          {activeChat?.groupAdmin?.email !== currentUser.email && (
            <div className="">
              <Button
                variant="destructive"
                className="items-center"
                onClick={() => setOpen(true)}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
        <div className="mt-4 flex space-x-2 items-center">
          <span className="text-md font-sans font-medium ml-2">Edit Name</span>
          <Input
            className="w-[180px] text-base font-sans "
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button
            variant="ghost"
            className="cursor-pointer"
            onClick={handleName}
          >
            <Pencil className="text-black" />
          </Button>
          {activeChat?.isGroupChat && (
            <div className="flex space-x-1 items-center ">
              <span className="text-xl font-semibold">Admin : </span>
              <span className="text-md font-medium">
                {activeChat.groupAdmin?.name}
              </span>
            </div>
          )}
        </div>
        <div className="mt-4 flex flex-col overflow-y-scroll h-full no-scrollbar ">
          {activeChat?.users.map((user) => (
            <GroupUser
              key={user._id}
              setDeletedUsers={setDeletedUser}
              DeletedUsers={deletedUser}
              user={user}
            />
          ))}
        </div>
      </div>
    </>
  );
};
