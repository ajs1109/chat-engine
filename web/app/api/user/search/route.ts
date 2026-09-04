import { type NextRequest } from "next/server";
import { proxyChatEngine } from "@/lib/chat-engine/http";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query")?.trim() ?? "";
  return proxyChatEngine({
    request,
    path: `/user/findUsers?search=${encodeURIComponent(query)}`
  });
}
