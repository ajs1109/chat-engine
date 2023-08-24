import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { User } from "./chatSlice";


interface UserData{
    userData: allData | null
}

interface allData {
    result: User;
    token:string;
}



const initialState:UserData = {
    userData:null,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers:{
        authSignin:(state,action:PayloadAction<allData>) => {
            localStorage.setItem('profile',JSON.stringify({...action?.payload}))
            state.userData = action?.payload
        },
        authLogout:(state) => {
        state.userData = null;
        localStorage.clear();
           
        }
    }
})

export default authSlice.reducer
export const {authSignin, authLogout} = authSlice.actions