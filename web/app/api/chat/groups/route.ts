import { type NextRequest } from "next/server";
import { jsonError, proxyChatEngine } from "@/lib/chat-engine/http";

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyChatEngine({
    request,
    method: "POST",
    path: "/chat/createGroupChat",
    body
  });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  if (!body.action) {
    return jsonError("INVALID_GROUP_ACTION", "Group action is required", 400);
  }

  const pathByAction: Record<string, string> = {
    rename: "/chat/renameGroup",
    removeUser: "/chat/removeFromGroup",
    leave: "/chat/deleteGroup"
  };

  const path = pathByAction[String(body.action)];
  if (!path) {
    return jsonError("INVALID_GROUP_ACTION", "Unsupported group action", 400);
  }

  return proxyChatEngine({
    request,
    method: "PUT",
    path,
    body
  });
}
