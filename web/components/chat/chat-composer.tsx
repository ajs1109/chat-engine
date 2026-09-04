"use client";

import { ChangeEvent, KeyboardEvent, useRef, useState } from "react";
import { Paperclip, SendHorizontal, X } from "lucide-react";
import type { Attachment } from "@/lib/types/chat";
import { uploadAttachment } from "@/lib/api/client";
import { AttachmentPreview } from "@/components/chat/attachment-preview";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/toast";

type ChatComposerProps = {
  disabled?: boolean;
  sending?: boolean;
  onSend: (content: string, attachments: Attachment[]) => Promise<void>;
  onTyping?: () => void;
  onStopTyping?: () => void;
};

export function ChatComposer({ disabled, sending, onSend, onTyping, onStopTyping }: ChatComposerProps) {
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const { toast } = useToast();

  async function handleSubmit() {
    const readyAttachments = attachments.filter((attachment) => attachment.status === "ready");
    if (!content.trim() && readyAttachments.length === 0) return;
    await onSend(content, readyAttachments);
    setContent("");
    setAttachments([]);
    onStopTyping?.();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      void handleSubmit();
      return;
    }

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit();
      return;
    }

    if (event.key === "Escape") {
      event.currentTarget.blur();
    }
  }

  function handleContentChange(value: string) {
    setContent(value);
    onTyping?.();
    if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = window.setTimeout(() => onStopTyping?.(), 2500);
  }

  async function handleFiles(files: FileList | File[]) {
    const uploads = Array.from(files);
    for (const file of uploads) {
      const tempId = crypto.randomUUID();
      const optimistic: Attachment = {
        id: tempId,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        status: "uploading"
      };
      setAttachments((current) => [...current, optimistic]);
      try {
        const uploaded = await uploadAttachment(file);
        URL.revokeObjectURL(optimistic.url);
        setAttachments((current) =>
          current.map((attachment) => (attachment.id === tempId ? uploaded : attachment))
        );
      } catch (error) {
        setAttachments((current) =>
          current.map((attachment) =>
            attachment.id === tempId ? { ...attachment, status: "failed" } : attachment
          )
        );
        toast({
          title: "Upload failed",
          description: error instanceof Error ? error.message : file.name,
          variant: "destructive"
        });
      }
    }
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      void handleFiles(event.target.files);
      event.target.value = "";
    }
  }

  return (
    <div
      className="rounded-[14px] bg-muted p-1.5 transition-colors data-[dragging=true]:bg-accent"
      data-dragging={dragging}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        void handleFiles(event.dataTransfer.files);
      }}
    >
      {attachments.length > 0 ? (
        <div className="chat-scrollbar mb-2 flex gap-2 overflow-x-auto pb-1">
          {attachments.map((attachment) => (
            <AttachmentPreview
              key={attachment.id}
              attachment={attachment}
              onRemove={() =>
                setAttachments((current) => current.filter((item) => item.id !== attachment.id))
              }
            />
          ))}
        </div>
      ) : null}
      <div className="flex items-end gap-1">
        <div className="flex items-center self-end">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            accept="image/*,.pdf,.txt,.md,.docx"
            onChange={onFileChange}
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-xl text-muted-foreground"
                  disabled={disabled}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-4 w-4" />
                  <span className="sr-only">Attach files</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Attach files or photos</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {content ? (
            <Button type="button" variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-muted-foreground" onClick={() => setContent("")}>
              <X className="h-4 w-4" />
              <span className="sr-only">Clear message</span>
            </Button>
          ) : null}
        </div>
        <Textarea
          value={content}
          disabled={disabled}
          placeholder="Message"
          aria-label="Message"
          rows={1}
          className="max-h-32 min-h-10 flex-1 resize-none border-0 bg-transparent px-2 py-2.5 shadow-none focus-visible:ring-0"
          onChange={(event) => handleContentChange(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button
          type="button"
          size="icon"
          className="h-10 w-10 shrink-0 rounded-xl"
          disabled={disabled || sending || (!content.trim() && attachments.every((a) => a.status !== "ready"))}
          onClick={() => void handleSubmit()}
        >
          <SendHorizontal className="h-4 w-4" />
          <span className="sr-only">{sending ? "Sending message" : "Send message"}</span>
        </Button>
      </div>
    </div>
  );
}
