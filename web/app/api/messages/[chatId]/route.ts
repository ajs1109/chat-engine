import { type NextRequest } from "next/server";
import { proxyChatEngine } from "@/lib/chat-engine/http";

type Params = {
  params: {
    chatId: string;
  };
};

export async function GET(request: NextRequest, { params }: Params) {
  return proxyChatEngine({
    request,
    path: `/messages/getMessages/${params.chatId}`
  });
}
