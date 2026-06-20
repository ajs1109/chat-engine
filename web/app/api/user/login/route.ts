import { type NextRequest } from "next/server";
import { proxyChatEngine } from "@/lib/chat-engine/http";

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyChatEngine({
    request,
    method: "POST",
    path: "/user/login",
    body
  });
}
