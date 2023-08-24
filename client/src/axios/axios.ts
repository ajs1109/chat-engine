import axios from "axios";

const instance = axios.create({
    baseURL: 'https://chat-application-9r1e.onrender.com'
})

instance.interceptors.request.use((req:any)=> {
    if(localStorage.getItem('profile'))(
        req.headers.Authorization = `Bearer ${JSON.parse(localStorage.getItem('profile') || '{}')?.token}`
    )
    return req;
})

export default instance;