import type { Attachment } from "@/lib/types/chat";

export function contentWithAttachmentMarkdown(content: string, attachments: Attachment[] = []) {
  const attachmentLines = attachments.map((attachment) => {
    if (attachment.type.startsWith("image/")) {
      return `![${attachment.name}](${attachment.url})`;
    }
    return `[${attachment.name}](${attachment.url})`;
  });

  return [content.trim(), ...attachmentLines].filter(Boolean).join("\n\n");
}

export function chatDisplayName(chatUsers: { _id: string; name: string }[], currentUserId?: string) {
  const peer = chatUsers.find((user) => user._id !== currentUserId);
  return peer?.name ?? chatUsers[0]?.name ?? "Direct chat";
}

export function initials(name?: string) {
  return (name ?? "CE")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
