import { messageProps } from "@/components/ChatsComponent/ChatContent/ChatBox";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface Chats {
  chats: Chat[] | null;
}

export interface Chat {
  _id: string;
  chatName: string;
  isGroupChat: boolean;
  users: User[];
  latestMessage?: messageProps;
  createdAt: string;
  updatedAt: string;
  __v: number;
  groupAdmin?: User;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  pic: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const initialState: Chats = {
  chats: null,
};

const chatSlice = createSlice({
  name: "chats",
  initialState,
  reducers: {
    chatsGetAll: (state, action: PayloadAction<Chat[]>) => {
      state.chats = action?.payload;
    },
    chatsAddChat: (state, action: PayloadAction<Chat>) => {
      state.chats?.unshift(action?.payload);
      console.log(state.chats);
    },
    editChatName: (state, action: PayloadAction<Chat>) => {
        const newChats = state.chats?.filter(
            chat => chat._id != action.payload._id
        );
        if(newChats) state.chats = newChats;

        state.chats?.unshift(action?.payload);
    },
    deleteUserFromGroup: (state, action: PayloadAction<Chat>) => {
        const newChats = state.chats?.filter(
            chat => chat._id !== action.payload._id
        )
        if(newChats) state.chats = newChats;

        state.chats?.unshift(action.payload);
        
    },
  },
});

export default chatSlice.reducer;
export const { chatsGetAll, chatsAddChat,editChatName,deleteUserFromGroup } = chatSlice.actions;
