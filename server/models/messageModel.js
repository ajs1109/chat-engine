import mongoose from "mongoose";

const messageModel = mongoose.Schema(
  {
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    content:{
        
    }
  },
  {
    timestamps: true,
  }
);

export const Chat = mongoose.model("Chat", chatModel);
