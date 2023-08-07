import mongoose from "mongoose";

const userModel = mongoose.Schema(
  {
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
  },
  pic:{
    type:String,
    required:true,
    default:null,
  },},
  {
    timestamps: true,
  }
);

export const User = mongoose.model("User", chatModel);
