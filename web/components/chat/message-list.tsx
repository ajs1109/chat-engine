"use client";

import { Check, Copy, RefreshCcw, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Attachment, ChatMessage } from "@/lib/types/chat";
import { initials } from "@/lib/chat-engine/messages";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AttachmentPreview } from "@/components/chat/attachment-preview";

type MessageListProps = {
  messages: ChatMessage[];
  currentUserId?: string;
  hiddenMessageIds: Set<string>;
  copiedMessageId?: string;
  onCopy: (message: ChatMessage) => void;
  onRetry: (message: ChatMessage) => void;
  onDelete: (messageId: string) => void;
};

export function MessageList({
  messages,
  currentUserId,
  hiddenMessageIds,
  copiedMessageId,
  onCopy,
  onRetry,
  onDelete
}: MessageListProps) {
  return (
    <div className="flex flex-col gap-5">
      {messages
        .filter((message) => !hiddenMessageIds.has(message._id))
        .map((message, index, visibleMessages) => {
          const mine = message.sender._id === currentUserId;
          const previous = visibleMessages[index - 1];
          const grouped = previous?.sender._id === message.sender._id;
          const attachments = (message.attachments ?? []) as Attachment[];

          return (
            <div key={message._id} className={`group flex gap-3 ${mine ? "justify-end" : "justify-start"}`}>
              {!mine && !grouped ? (
                <Avatar className="mt-1 h-8 w-8">
                  <AvatarImage src={message.sender.pic ?? ""} alt={message.sender.name} />
                  <AvatarFallback>{initials(message.sender.name)}</AvatarFallback>
                </Avatar>
              ) : !mine ? (
                <div className="w-8" />
              ) : null}
              <div className={`flex max-w-[82%] flex-col ${mine ? "items-end" : "items-start"}`}>
                {!grouped ? (
                  <div className="mb-1 flex items-center gap-2 px-1 text-xs text-muted-foreground">
                    <span>{mine ? "You" : message.sender.name}</span>
                    <span>{formatTime(message.createdAt)}</span>
                  </div>
                ) : null}
                <div
                  className={`rounded-lg px-4 py-2 text-sm leading-6 shadow-sm ${
                    mine
                      ? "bg-primary text-primary-foreground"
                      : "border bg-background text-foreground"
                  }`}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    className="prose prose-sm max-w-none break-words dark:prose-invert prose-pre:overflow-auto prose-pre:rounded-md prose-pre:bg-foreground/10"
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
                {attachments.length > 0 ? (
                  <div className="mt-2 flex max-w-full flex-wrap gap-2">
                    {attachments.map((attachment) => (
                      <AttachmentPreview key={attachment.id} attachment={attachment} />
                    ))}
                  </div>
                ) : null}
                <div className="mt-1 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <MessageAction label="Copy" onClick={() => onCopy(message)}>
                    {copiedMessageId === message._id ? <Check /> : <Copy />}
                  </MessageAction>
                  {!mine ? (
                    <MessageAction label="Retry" onClick={() => onRetry(message)}>
                      <RefreshCcw />
                    </MessageAction>
                  ) : null}
                  <MessageAction label="Hide message" onClick={() => onDelete(message._id)}>
                    <Trash2 />
                  </MessageAction>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
}

function MessageAction({
  label,
  onClick,
  children
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={onClick}>
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function formatTime(date: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(date));
}
