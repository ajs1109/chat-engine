import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Bell } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { currentChatProps, messageProps, newMessageReceivedProps } from './ChatContent/ChatBox';
import { Badge } from '../ui/badge';
import { setActiveChat } from '@/features/activeChat';
import { seen } from '@/features/commonData';

const Notifications = () => {
  const dispatch = useDispatch();
  const { notificationData } = useSelector(
    (state: newMessageReceivedProps) => state.commonData
  );
  const handleClick = (message:messageProps) => {
    dispatch(setActiveChat(message.chat));
    dispatch(seen(message));
  }
  return (
    <div className="mt-auto w-full">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="relative w-full">
            {notificationData?.length && (
              <Badge className="w-4 h-4 flex justify-center right-[-3px] rounded-full top-[-6px] absolute p-0">
                {notificationData?.length}
              </Badge>
            )}
            <Bell className="my-auto" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-[250px] mr-[125px]'>
          <DropdownMenuLabel className='font-semibold tracking-wider'>NOTIFICATIONS</DropdownMenuLabel>
          <DropdownMenuSeparator className='text-red-600'/>
          <div className='max-h-[200px] overflow-auto no-scrollbar flex flex-col'>
            {notificationData?.length &&
              notificationData.map((item, index) => (
                <div key={index}>
                  <DropdownMenuItem className='bg-slate-200 mt-2 mx-1 cursor-pointer' onClick={() => handleClick(item)}>{`${item.sender.name} : ${item.content}`}</DropdownMenuItem>
                </div>
              ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default Notifications