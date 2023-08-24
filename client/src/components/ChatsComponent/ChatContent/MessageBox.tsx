import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@/features/chatSlice'


const MessageBox = ({sender,content,classs,pict}:{sender:User,content:string,classs:string,pict:string}) => {
  return (
    <div className={classs}>
      <Avatar className={pict}>
        <AvatarImage
          src={`http://localhost:5000/uploads/profilePicture/${sender.pic}`}
          alt="@shadcn"
        />
        <AvatarFallback>{sender.name[0].toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className='bg-[#0071d9] text-[#b5babf] font- rounded-lg px-2 pt-[2px] h-8'>{content}</div>
    </div>
  );
}

export default MessageBox