import axios from "@/axios/axios";
import { User } from "@/features/chatSlice";
import { getProfileImageUrl } from "@/lib/config";
import { Badge } from "../ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { Dispatch, SetStateAction } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function DialogDemo({
  setGroupCreated,
  groupCreated,
}: {
  setGroupCreated: Dispatch<SetStateAction<boolean>>;
  groupCreated: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [friendName, setFriendName] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [userArray, setUserArray] = useState<User[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await axios.get(`/user/findUsers`);
        setUserArray(res.data.users || []);
      } catch (err) {
        console.log(err);
      }
    };

    void loadUsers();
  }, []);

  const newArray = useMemo(
    () =>
      userArray.filter((user) => {
        const match = user.name.toLowerCase().includes(friendName.toLowerCase());
        const selected = users.some((selectedUser) => selectedUser._id === user._id);
        return match && !selected;
      }),
    [friendName, userArray, users]
  );

  const handleUserClick = (item: User | undefined) => {
    if (!item || users.some((user) => user._id === item._id)) {
      return;
    }

    setUsers((prev) => [...prev, item]);
  };

  const deleteFromGroup = (item: User) => {
    setUsers((prev) => prev.filter((user) => user._id !== item._id));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const newusers = JSON.stringify(users.map((user) => user._id));
      const { data } = await axios.post("/chat/createGroupChat", {
        name,
        newusers,
      });
      if (data) {
        setGroupCreated(!groupCreated);
      }
      toast.success("Successfully created");
    } catch (err) {
      console.log(err);
      toast.error("Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          New Group <Plus className="ml-1 h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] flex flex-col max-h-[80%]">
        <DialogHeader>
          <DialogTitle>Create a Group</DialogTitle>
          <DialogDescription>Create a new Group Chat with your friends</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid w-full px-2 mx-auto gap-4">
            <Input
              id="name"
              name="name"
              placeholder="New Group Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid w-full pt-2 px-2 mx-auto gap-4">
            <Input
              id="username"
              placeholder="Add Friends"
              value={friendName}
              onChange={(e) => setFriendName(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <div className="overflow-auto py-3 h-fit flex flex-nowrap no-scrollbar">
          {users.map((item) => (
            <Badge
              className="hover:cursor-pointer mr-1 my-0.5 h-5 w-fit flex flex-nowrap"
              onClick={() => deleteFromGroup(item)}
              key={item._id}
            >
              <div className="mr-1">{item.name.split(" ")[0]}</div>
              <div>{item.name.split(" ")[1]}</div>
              <X className="h-3 w-3" />
            </Badge>
          ))}
        </div>
        <div className="h-full overflow-auto no-scrollbar">
          {newArray.map((item) => (
            <div
              className="flex bg-slate-300 rounded-md my-2 hover:bg-slate-500 transition-all duration-100 cursor-pointer w-full"
              onClick={() => handleUserClick(item)}
              key={item._id}
            >
              <Avatar className="m-2">
                <AvatarImage src={getProfileImageUrl(item.pic)} alt="profile" />
                <AvatarFallback>{item.name[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col justify-evenly">
                <div className="text-sm">{item.name}</div>
                <div className="text-sm">Email : {item.email}</div>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <DialogTrigger>
            <Button type="submit" variant="outline" onClick={handleSubmit} disabled={loading}>
              Create Group
            </Button>
          </DialogTrigger>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DialogDemo;

