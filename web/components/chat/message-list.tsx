"use client";

import { Check, Copy } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Attachment, ChatMessage } from "@/lib/types/chat";
import { initials } from "@/lib/chat-engine/messages";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AttachmentPreview } from "@/components/chat/attachment-preview";
import { cn } from "@/lib/utils";

type MessageListProps = {
  messages: ChatMessage[];
  currentUserId?: string;
  copiedMessageId?: string;
  onCopy: (message: ChatMessage) => void;
};

export function MessageList({
  messages,
  currentUserId,
  copiedMessageId,
  onCopy
}: MessageListProps) {
  return (
    <div className="flex flex-col gap-1.5 py-1">
      {messages.map((message, index, visibleMessages) => {
          const mine = message.sender._id === currentUserId;
          const previous = visibleMessages[index - 1];
          const grouped = previous?.sender._id === message.sender._id;
          const attachments = (message.attachments ?? []) as Attachment[];

          return (
            <div key={message._id} className={`group flex gap-2.5 ${mine ? "justify-end" : "justify-start"}`}>
              {!mine && !grouped ? (
                <Avatar className="mt-1 h-8 w-8 shadow-sm">
                  <AvatarImage src={message.sender.pic ?? ""} alt={message.sender.name} />
                  <AvatarFallback>{initials(message.sender.name)}</AvatarFallback>
                </Avatar>
              ) : !mine ? (
                <div className="w-8" />
              ) : null}
              <div className={`relative flex max-w-[88%] flex-col sm:max-w-[76%] ${mine ? "items-end" : "items-start"}`}>
                {!grouped ? (
                  <div className="mb-1 px-1 text-[11px] font-medium text-muted-foreground">
                    <span>{mine ? "You" : message.sender.name}</span>
                  </div>
                ) : null}
                <div
                  className={`rounded-[14px] px-3.5 py-2 text-sm leading-6 shadow-[0_2px_8px_-5px_hsl(var(--foreground)/0.5)] ${
                    mine
                      ? "rounded-br-[4px] bg-[hsl(var(--message-sent))] text-white"
                      : "rounded-bl-[4px] bg-[hsl(var(--message-incoming))] text-foreground"
                  }`}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    className="prose prose-sm max-w-none break-words dark:prose-invert prose-pre:overflow-auto prose-pre:rounded-md prose-pre:bg-foreground/10"
                  >
                    {message.content}
                  </ReactMarkdown>
                  <time
                    dateTime={message.createdAt}
                    className={`mt-0.5 block text-right text-[10px] tabular-nums ${mine ? "text-white/90" : "text-muted-foreground"}`}
                  >
                    {formatTime(message.createdAt)}
                  </time>
                </div>
                {attachments.length > 0 ? (
                  <div className="mt-2 flex max-w-full flex-wrap gap-2">
                    {attachments.map((attachment) => (
                      <AttachmentPreview key={attachment.id} attachment={attachment} />
                    ))}
                  </div>
                ) : null}
                <div
                  className={cn(
                    "pointer-events-none absolute top-full z-10 mt-0.5 flex items-center rounded-lg border bg-popover p-0.5 opacity-0 shadow-sm transition-opacity",
                    "group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100",
                    mine ? "right-0" : "left-0"
                  )}
                >
                  <MessageAction label="Copy" onClick={() => onCopy(message)}>
                    {copiedMessageId === message._id ? <Check /> : <Copy />}
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
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            aria-label={label}
            onClick={onClick}
          >
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
