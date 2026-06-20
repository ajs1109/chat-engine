import axios from "@/axios/axios";
import { getProfileImageUrl } from "@/lib/config";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

type searchFriendProps = {
  name: string;
  email: string;
  pic: string;
  userId?: string;
};

const SearchFriend = ({ name, email, pic, userId }: searchFriendProps) => {
  const accessChat = async () => {
    try {
      await axios.post("/chat/createChat", { userId });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      className="flex bg-slate-300 rounded-md my-2 hover:bg-slate-500 transition-all duration-100 cursor-pointer w-full"
      onClick={accessChat}
    >
      <Avatar className="m-2">
        <AvatarImage src={getProfileImageUrl(pic)} alt="profile" />
        <AvatarFallback>{name[0].toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col justify-evenly">
        <div className="text-sm">{name}</div>
        <div className="text-sm">Email : {email}</div>
      </div>
    </div>
  );
};

export default SearchFriend;

