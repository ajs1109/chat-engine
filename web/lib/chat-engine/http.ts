import { NextResponse, type NextRequest } from "next/server";
import { serverEnv } from "@/lib/chat-engine/env";

type ProxyOptions = {
  method?: string;
  path: string;
  request: NextRequest;
  body?: unknown;
};

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function jsonError(code: string, message: string, status = 500, details?: unknown) {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code,
        message,
        details
      }
    },
    { status }
  );
}

export async function proxyChatEngine({ method = "GET", path, request, body }: ProxyOptions) {
  const token = request.headers.get("authorization");
  const response = await fetch(`${serverEnv.CHAT_ENGINE_API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { authorization: token } : {})
    },
    body: body == null ? undefined : JSON.stringify(body),
    cache: "no-store"
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload && "message" in payload
        ? String(payload.message)
        : "Chat engine request failed";
    return jsonError("CHAT_ENGINE_REQUEST_FAILED", message, response.status, payload);
  }

  return jsonOk(payload, { status: response.status });
}
