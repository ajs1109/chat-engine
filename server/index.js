import  express  from "express";
import bodyParser from "body-parser";
import 'dotenv/config'
import mongoose from "mongoose";
import cors from 'cors';
import userRouter from './routes/users.js'
import chatRouter from './routes/chats.js'
import messagesRouter from './routes/messages.js'
import {Server} from 'socket.io'


const app = express();
app.use(bodyParser.json({limit:'300mb',extended:true}));
app.use(bodyParser.urlencoded({ extended:true,limit:'300mb' }));
app.use(cors());


app.use('/uploads',express.static('uploads'))

app.use('/user',userRouter);
app.use('/chat',chatRouter);
app.use('/messages', messagesRouter);

const PORT = process.env.PORT 

const CONNECTION_URL = process.env.CONNECTION_URL

mongoose.connect(CONNECTION_URL)
.then(()=> {
    const server = app.listen(PORT,() => console.log('Server is listening on port', PORT))
    const io = new Server(server, {
      pingTimeout: 60000,
      cors: {
        origin: "https://chat-engine-gules.vercel.app",
      },
    });
    io.on("connection", (socket) => {
      console.log("connected to socket.io");
      socket.on("setup",(userData)=> {
        console.log(userData._id);
        socket.join(userData._id);
        socket.emit("connected");
      })
      socket.on("join chat", room => {
        socket.join(room);
        console.log("user joined room : ",room);
      })
        socket.on("typing" , (room) => socket.in(room).emit("typing"))
      socket.on("stop typing" , (room) => socket.in(room).emit("stop typing"))
      socket.on("new message", (newMessageReceived) => {
        var chat = newMessageReceived.chat;
        if(!chat.users) return console.log("chat.users is not defined")
        chat.users.forEach(user => {
            if(user._id === newMessageReceived.sender._id) return;
            socket.in(user._id).emit("message received",newMessageReceived);
        })
      })

    
    });
})
.catch(err => console.log('Error connecting to port'))

