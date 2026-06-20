import { AlertModal } from "@/components/Pages/modals/alertModal";
import { Input } from "@/components/ui/input";
import {
  activeChatProps,
  deleteUser,
  renameGroup,
  setActiveChat,
} from "@/features/activeChat";
import { User, deleteUserFromGroup, editChatName } from "@/features/chatSlice";
import { getStoredProfile } from "@/lib/profile";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import axios from "@/axios/axios";
import { GroupUser } from "../GroupUsers";
import { Button } from "@/components/ui/button";

interface currentChatProps {
  activeChat: activeChatProps;
}

export const GroupSettings = () => {
  const dispatch = useDispatch();
  const { activeChat } = useSelector((state: currentChatProps) => state.activeChat);
  const { result: currentUser } = getStoredProfile();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(activeChat?.chatName);
  const [deletedUser, setDeletedUser] = useState<User | null>(null);

  useEffect(() => {
    setName(activeChat?.chatName);
  }, [activeChat?.chatName]);

  useEffect(() => {
    const removeUser = async () => {
      if (!deletedUser || !activeChat?._id) {
        return;
      }

      try {
        const putData = {
          chatId: activeChat._id,
          userId: deletedUser._id,
        };

        const { data } = await axios.put("/chat/removeFromGroup", putData);
        dispatch(deleteUser(deletedUser));
        dispatch(deleteUserFromGroup(data));
        toast.success("User removed from group");
      } catch (err) {
        console.log(err);
        toast.error("Failed to remove user");
      } finally {
        setDeletedUser(null);
      }
    };

    void removeUser();
  }, [activeChat?._id, deletedUser, dispatch]);

  const leaveGroup = async () => {
    if (!activeChat?._id) {
      return;
    }

    try {
      setLoading(true);
      await axios.put("/chat/deleteGroup", { chatId: activeChat._id });
      setOpen(false);
      dispatch(setActiveChat(null));
      toast.success("Group left successfully");
    } catch (err) {
      console.log(err);
      toast.error("Could not leave group");
    } finally {
      setLoading(false);
    }
  };

  const handleName = async () => {
    if (!activeChat?._id || !name?.trim()) {
      return;
    }

    try {
      const putData = {
        chatId: activeChat._id,
        chatName: name.trim(),
      };
      const { data } = await axios.put("/chat/renameGroup", putData);
      dispatch(renameGroup(data.chatName));
      dispatch(editChatName(data));
      toast.success("Group name updated");
    } catch (err) {
      console.log(err);
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
        onConfirm={leaveGroup}
        loading={loading}
      />
      <div className="bg-white flex flex-col rounded-md mt-2 w-full max-h-full">
        <div className="flex justify-between mx-2 items-center">
          <span className="text-2xl font-sans font-medium mt-2">Group Settings</span>
          {activeChat?.groupAdmin?.email !== currentUser?.email && (
            <Button variant="destructive" className="items-center" onClick={() => setOpen(true)}>
              <Trash2 className="h-5 w-5" />
            </Button>
          )}
        </div>
        <div className="mt-4 flex space-x-2 items-center">
          <span className="text-md font-sans font-medium ml-2">Edit Name</span>
          <Input
            className="w-[180px] text-base font-sans"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button variant="ghost" className="cursor-pointer" onClick={handleName}>
            <Pencil className="text-black" />
          </Button>
          {activeChat?.isGroupChat && (
            <div className="flex space-x-1 items-center">
              <span className="text-xl font-semibold">Admin :</span>
              <span className="text-md font-medium">{activeChat.groupAdmin?.name}</span>
            </div>
          )}
        </div>
        <div className="mt-4 flex flex-col overflow-y-scroll h-full no-scrollbar">
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

