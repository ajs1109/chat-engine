import { z } from "zod";

const serverEnvSchema = z.object({
  CHAT_ENGINE_API_URL: z.string().url().default("http://127.0.0.1:5000"),
  NEXT_PUBLIC_SOCKET_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  UPLOAD_MAX_BYTES: z.coerce.number().int().positive().default(10 * 1024 * 1024)
});

export const serverEnv = serverEnvSchema.parse({
  CHAT_ENGINE_API_URL: process.env.CHAT_ENGINE_API_URL,
  NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  UPLOAD_MAX_BYTES: process.env.UPLOAD_MAX_BYTES
});

export const clientEnv = {
  socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL
};
