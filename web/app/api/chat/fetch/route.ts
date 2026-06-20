import { type NextRequest } from "next/server";
import { proxyChatEngine } from "@/lib/chat-engine/http";

export async function GET(request: NextRequest) {
  return proxyChatEngine({
    request,
    path: "/chat/fetchChats"
  });
}
