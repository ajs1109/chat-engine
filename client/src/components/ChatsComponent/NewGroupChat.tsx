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
import { useState, useEffect } from "react";
import axios from "@/axios/axios";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { User } from "@/features/chatSlice";
import { toast } from "react-hot-toast";
import { Dispatch, SetStateAction } from "react";

export function DialogDemo({
  setGroupCreated,groupCreated
}: {
  setGroupCreated: Dispatch<SetStateAction<boolean>>;
  groupCreated:Boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [friendName, setFriendName] = useState("");
  const [users, setUsers] = useState<User[] | []>([]);
  const [userArray, setUserArray] = useState<User[] | []>([]);
  const [newArray, setNewArray] = useState<User[] | []>([]);

  useEffect(() => {
    axios.get(`/user/findUsers`).then((res) => {
      setUserArray(res.data.users);
      setNewArray(res.data.users);
    });
  }, []);

  useEffect(() => {
    const newList = userArray?.filter((user) => {
      return user.name.toLowerCase().includes(`${friendName}`.toLowerCase());
    });
    setNewArray(newList);
    console.log("newArray : ", newArray);
  }, [friendName]);

  const handleUserClick = (item: User | undefined) => {
    if (item) {
      const newUsers: User[] | [] = [...users, item];
      setUsers(newUsers);
    }
    console.log("newUsers : ", users);
    setNewArray(
      newArray.filter((user) => {
        return user !== item;
      })
    );
  };

  const deleteFromGroup = (item: User) => {
    setUsers(
      users.filter((user) => {
        return user !== item;
      })
    );
    setNewArray([...newArray, item]);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const newusers = JSON.stringify(users);
      const { data } = await axios.post("/chat/createGroupChat", {
        name,
        newusers,
      });
      if (data) setGroupCreated(!groupCreated);
      console.log(data);
      toast.success("Successfully created");
    } catch (err: any) {
      console.log(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      {/* to remove error */}
      {!loading && <></>}
      <DialogTrigger asChild>
        <Button variant="outline">
          New Group <Plus className="ml-1 h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] flex flex-col max-h-[80%]">
        <DialogHeader>
          <DialogTitle>Create a Group</DialogTitle>
          <DialogDescription>
            Create a new Group Chat with your friends
          </DialogDescription> 
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
          {users.map((item: User, index: number) => (
            <Badge
              className="hover:cursor-pointer mr-1 my-0.5 h-5 w-fit flex flex-nowrap"
              onClick={() => deleteFromGroup(item)}
              key={index}
            >
              <div className="mr-1">{item.name.split(" ")[0]}</div>
              <div className="">{item.name.split(" ")[1]}</div>
              <X className="h-3 w-3" />{" "}
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
                <AvatarImage
                  src={`http://localhost:5000/uploads/profilePicture/${item.pic}`}
                  alt="@shadcn"
                />
                <AvatarFallback>{`${item.name[0].toUpperCase()}`}</AvatarFallback>
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
            <Button
              type="submit"
              variant="outline"
              onClick={handleSubmit}
              // disabled={loading}
            >
              Create Group
            </Button>
          </DialogTrigger>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DialogDemo;
