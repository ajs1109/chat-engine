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
import { useState, useEffect, useRef } from "react";
import axios from "@/axios/axios";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";



interface users {
  email: string;
  name: string;
  pic: string;
  _id: string;
}
// const initialUsers = {
//   name: "",
//   email: "",
//   pic: "",
//   _id: "",
// };

type groupDataProps = {
    name: string;
    friends: string[] | [];
}
const initialState:groupDataProps = {
  name: "",
  friends: [],
};

export function DialogDemo() {
  const ref = useRef();
  const [groupData, setGroupData] = useState(initialState);
  const [friendName, setFriendName] = useState("");
  const [userArray, setUserArray] = useState<Array<users>>([]);
  const [newArray, setNewArray] = useState<Array<users>>([]);
  useEffect(() => {
    axios.get(`/user/findUsers`).then((res) => {
      setUserArray(res.data.users);
    });
  }, []);

  useEffect(() => {
    const newList = userArray?.filter((user) => {
      return user.name.toLowerCase().includes(`${friendName}`.toLowerCase());
    });
    setNewArray(newList);
    console.log(newArray);
  }, [friendName]);

  const handleUserClick = (newFriend:string ) => {
    const updatedFriends = [...groupData.friends, newFriend]
    setGroupData({...groupData, friends:updatedFriends});
    console.log(groupData)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          New Group Chat <Plus className="ml-1 h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
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
              value={groupData.name}
              onChange={(e) =>
                setGroupData({ ...groupData, name: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid w-full p-2 mx-auto gap-4">
            <Input
              id="username"
              placeholder="Add Friends"
              value={friendName}
              onChange={(e) => setFriendName(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <div>
            {
                groupData.friends.map(item => (
                    <Badge className="hover:cursor-pointer mr-1 my-0.5 h-5 w-fit">{item} <X className="h-3 w-3"/> </Badge>
                ))
            }
        </div>
        <div>
        
            {newArray.map((item) => (
              <div className="flex bg-slate-300 rounded-md my-2 hover:bg-slate-500 transition-all duration-100 cursor-pointer w-full"
              onClick={() => handleUserClick(item.name)} key={item._id}
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
        {/* <SkeletonDemo /> */}
        <DialogFooter>
          <Button type="submit" variant="outline">
            Create Group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DialogDemo;
