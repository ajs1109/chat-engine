import { User } from "@/features/chatSlice";
import { Trash2 } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import SearchFriend from "./SearchFriend";

export const GroupUser = ({
    user,

    setDeletedUsers,
}:{
    user: User;
    DeletedUsers: User | null;
    setDeletedUsers: Dispatch<SetStateAction<User | null>>;
}) => {
    return (
      <div className="relative">
        <SearchFriend
          name={user.name}
          email={user.email}
          pic={user.pic}
          userId={user._id}
        />
        <div
          className="z-10 text-red-950 top-4 right-2 absolute"
          
        

        > 
          <Trash2 className="h-5 w-5" onClick={() => setDeletedUsers(user)} />
        </div>
      </div>
    );
}