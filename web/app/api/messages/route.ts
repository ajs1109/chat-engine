import { type NextRequest } from "next/server";
import { contentWithAttachmentMarkdown } from "@/lib/chat-engine/messages";
import { jsonError, proxyChatEngine } from "@/lib/chat-engine/http";
import { attachmentSchema } from "@/lib/types/chat";
import { z } from "zod";

const sendMessageSchema = z.object({
  chatId: z.string().min(1),
  content: z.string().max(5000).default(""),
  attachments: z.array(attachmentSchema).default([])
});

export async function POST(request: NextRequest) {
  const parsed = sendMessageSchema.safeParse(await request.json());
  if (!parsed.success) {
    return jsonError("INVALID_MESSAGE_PAYLOAD", "Message payload is invalid", 400, parsed.error.flatten());
  }

  const { chatId, content, attachments } = parsed.data;
  if (!content.trim() && attachments.length === 0) {
    return jsonError("EMPTY_MESSAGE", "Message content or attachments are required", 400);
  }

  return proxyChatEngine({
    request,
    method: "POST",
    path: "/messages/sendMessage",
    body: {
      chatId,
      content: contentWithAttachmentMarkdown(content, attachments),
      attachments
    }
  });
}
