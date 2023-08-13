import { activeChatProps } from "@/features/activeChat";
import { AlignJustify, LogOut, PencilLine } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { AlertModal } from "../Pages/modals/alertModal";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface currentChatProps {
  activeChat: activeChatProps | null;
}

const Chat = () => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const leaveGroup = () => {
    setOpen(false);
  };

  //@ts-ignore
  const { result } = JSON.parse(localStorage.getItem("profile"));
  const name = result?.name;
  const activeChat = useSelector((state: currentChatProps) => state.activeChat);
  console.log("chat : ", activeChat);
  return activeChat?.activeChat ? (
    <div className="basis-[70%] bg-slate-200 rounded-md">
      <div className="flex justify-between bg-slate-300 rounded-sm h-16 items-center">
        <div className="flex">
          <div className="mx-3">
            {" "}
            <Avatar className="m-auto">
              <AvatarImage
                src={
                  name === activeChat?.activeChat?.users[0].name
                    ? `http://localhost:5000/uploads/profilePicture/${activeChat?.activeChat?.users[1].pic}`
                    : `http://localhost:5000/uploads/profilePicture/${activeChat?.activeChat?.users[0].pic}`
                }
                alt="@shadcn"
              />
              <AvatarFallback>
                {activeChat?.activeChat?.users[0].name[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="text-lg font-mono">
            {activeChat?.activeChat?.chatName}
          </div>
        </div>
        <div className="mr-3">
          <AlertModal
            isOpen={open}
            onClose={() => setOpen(false)}
            onConfirm={leaveGroup}
            loading={loading}
          />
          <Dialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <AlignJustify className="h-6 w-6 duration-200 hover:text-white cursor-pointer" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DialogTrigger asChild>
                  <DropdownMenuItem>
                    <span className="flex">
                      <PencilLine className="mr-1 h-4 w-4" />
                      Update Group
                    </span>
                  </DropdownMenuItem>
                </DialogTrigger>
                <DropdownMenuItem onClick={() => setOpen(true)}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Leave Group
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Update Group</DialogTitle>
                <DialogDescription>
                  Make changes to your group.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input id="name" value={name} className="col-span-3" />
                </div>
                <div className="flex flex-col">
                  
                </div>
              </div>
              <DialogFooter>
                <DialogTrigger>
                  <Button type="submit">Save changes</Button>
                </DialogTrigger>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  ) : (
    <div className="basis-[70%] h-[700px] bg-slate-200 rounded-md m-auto">
      click on a friend to start chatting
    </div>
  );
};

export default Chat;
