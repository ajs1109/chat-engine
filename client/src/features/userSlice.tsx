import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { User } from "./chatSlice";

interface UserData{
    userData: User | null
}



const initialState:UserData = {
    authData:null,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers:{
        authSignin:(state,action:PayloadAction<allData>) => {
            localStorage.setItem('profile',JSON.stringify({...action?.payload}))
            state.authData = action?.payload
        },
        authLogout:(state,action) => {
            localStorage.clear();
            state.authData = null;
        }
    }
})

export default authSlice.reducer
export const {authSignin, authLogout} = authSlice.actions