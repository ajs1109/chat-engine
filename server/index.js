import  express  from "express";
import bodyParser from "body-parser";
import 'dotenv/config'
import mongoose from "mongoose";
import cors from 'cors';
import userRouter from './routes/users.js'
import chatRouter from './routes/chats.js'
import messagesRouter from './routes/messages.js'

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
    app.listen(PORT,() => console.log('Server is listening on port', PORT))
})
.catch(err => console.log('Error connecting to port'))