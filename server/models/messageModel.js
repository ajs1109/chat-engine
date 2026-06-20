import mongoose from "mongoose";

const messageModel = mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: {
      type: String,
      trim: true,
      required: true,
      maxlength: 5000,
    },
    attachments: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true, trim: true },
        size: { type: Number, required: true, min: 0 },
        type: { type: String, required: true, trim: true },
        url: { type: String, required: true, trim: true },
        status: {
          type: String,
          enum: ["uploading", "ready", "failed"],
          default: "ready",
        },
      },
    ],
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

messageModel.index({ chat: 1, createdAt: -1 });

export const Message = mongoose.model("Message", messageModel);
