import { z } from "zod";

export const userSchema = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.string().email().optional().or(z.literal("")),
  pic: z.string().nullable().optional()
});

export const attachmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  size: z.number().int().nonnegative(),
  type: z.string(),
  url: z.string(),
  status: z.enum(["uploading", "ready", "failed"]).default("ready")
});

export const messageSchema = z.object({
  _id: z.string(),
  content: z.string(),
  sender: userSchema,
  chat: z.union([
    z.string(),
    z.object({
      _id: z.string(),
      users: z.array(userSchema).optional()
    }).passthrough()
  ]),
  attachments: z.array(attachmentSchema).optional().default([]),
  createdAt: z.string(),
  updatedAt: z.string().optional()
});

export const chatSchema = z.object({
  _id: z.string(),
  chatName: z.string().default("Chat"),
  isGroupChat: z.boolean().default(false),
  users: z.array(userSchema),
  latestMessage: messageSchema.partial().nullable().optional(),
  groupAdmin: userSchema.nullable().optional(),
  updatedAt: z.string().optional()
});

export const authProfileSchema = z.object({
  token: z.string(),
  result: userSchema
});

export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.unknown().optional()
});

export type ApiError = z.infer<typeof apiErrorSchema>;
export type Attachment = z.infer<typeof attachmentSchema>;
export type Chat = z.infer<typeof chatSchema>;
export type ChatMessage = z.infer<typeof messageSchema>;
export type User = z.infer<typeof userSchema>;
export type AuthProfile = z.infer<typeof authProfileSchema>;

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError };
