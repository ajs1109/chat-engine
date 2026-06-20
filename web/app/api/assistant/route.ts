import { type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { message } = (await request.json()) as { message?: string };
  const prompt = String(message ?? "").trim();
  const responseText = prompt
    ? `I can help you work with this chat engine. You asked: "${prompt}". The migrated Next.js app keeps the existing Express chat backend, adds typed proxy routes, and supports the polished assistant-ui shell you are using here.`
    : "Start by asking about chats, sessions, uploads, or the migration architecture.";

  const encoder = new TextEncoder();
  const words = responseText.split(/(\s+)/);

  const stream = new ReadableStream({
    async start(controller) {
      for (const word of words) {
        controller.enqueue(encoder.encode(word));
        await new Promise((resolve) => setTimeout(resolve, 12));
      }
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}
