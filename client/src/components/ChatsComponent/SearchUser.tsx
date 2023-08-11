import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Search } from "lucide-react";
import SearchFriend from "./SearchFriend";
import { useEffect, useState } from "react";
import axios from '@/axios/axios'
import { SkeletonDemo } from "./SkeletonDemo";

type userProps = {
  name: string;
  email: string;
  pic:string;
  _id:string;
}

export function SheetDemo() {
  const [users,setUsers] = useState([])
  const [search,setSearch] = useState('');
  const [loading, setLoading] = useState(false)
  const findUser = async () => {
    try{
      setLoading(true)
      const res = await axios.get(`/user/findUsers?search=${search}`);
    console.log(res.data.users)
      setUsers(() => res.data.users)
}


    catch(err:any) {
      console.log(err.response.data)
    }finally{
      setLoading(false)
    }
  }
  return (
    <Sheet key="left">
      <SheetTrigger asChild>
        <Button className="px-2 my-auto border-none" variant="ghost">
          <Search /> <p className="px-2">Search Friend</p>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[100%] sm:w-[320px]">
        <SheetHeader>
          <SheetTitle>Search</SheetTitle>
          <SheetDescription>
            Search for a friend and start chatting.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4 flex w-full max-w-sm items-center space-x-2">
          <Input
            type="email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="abc@example.com"
            className="outline-none"
          />
          <Button type="submit" onClick={findUser}>
            Go
          </Button>
        </div>
        { loading ? (
          <SkeletonDemo />
        ) : (
          users.map((item: userProps) => (
            <SearchFriend
              name={item?.name}
              email={item?.email}
              pic={item?.pic}
              key={item?._id}
              userId={item?._id}
            />
          ))
        )}
      </SheetContent>
    </Sheet>
  );
}
