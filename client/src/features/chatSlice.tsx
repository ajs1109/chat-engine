import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface Chats {
    chats:Chat[] | null;
}

export interface Chat {
  _id: string;
  chatName: string;
  isGroupChat: boolean;
  users: User[];
  createdAt: string;
  updatedAt: string;
  __v: number;
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
    chats:null,
}



const chatSlice = createSlice({
    name:'chats',
    initialState,
    reducers:{
        chatsGetAll:(state,action:PayloadAction<Chat[]>) => {
            state.chats = action?.payload
        },
        chatsAddChat: (state,action:PayloadAction<Chat>) =>{
            state.chats?.unshift(action?.payload);
            console.log(state.chats);
        
    },
    },
    
})


export default chatSlice.reducer;
export const {chatsGetAll, chatsAddChat} =chatSlice.actions