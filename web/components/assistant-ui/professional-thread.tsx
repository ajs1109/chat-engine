"use client";

import {
  ActionBarPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive
} from "@assistant-ui/react";
import { MarkdownTextPrimitive } from "@assistant-ui/react-markdown";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Copy,
  Paperclip,
  Pencil,
  RefreshCcw,
  Square
} from "lucide-react";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import { Button } from "@/components/ui/button";

export function ProfessionalThread() {
  return (
    <ThreadPrimitive.Root className="flex h-full min-h-[560px] flex-col bg-background">
      <ThreadPrimitive.Viewport className="chat-scrollbar flex flex-1 flex-col overflow-y-auto px-4">
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 py-6">
          <ThreadPrimitive.Empty>
            <div className="mx-auto grid max-w-xl gap-3 text-center">
              <h2 className="text-2xl font-semibold">Ask the assistant</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Use this surface for AI-style workflows while the team chat keeps using the preserved chat engine backend.
              </p>
            </div>
          </ThreadPrimitive.Empty>
          <ThreadPrimitive.Messages
            components={{
              UserMessage,
              AssistantMessage
            }}
          />
        </div>
        <div className="sticky bottom-0 bg-background/95 pb-4 pt-2 backdrop-blur">
          <ThreadPrimitive.ScrollToBottom asChild>
            <TooltipIconButton
              tooltip="Scroll to latest"
              className="mx-auto mb-2 hidden rounded-full border bg-background data-[visible=true]:flex"
            >
              <ArrowDown />
            </TooltipIconButton>
          </ThreadPrimitive.ScrollToBottom>
          <Composer />
        </div>
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  );
}

function AssistantMessage() {
  return (
    <MessagePrimitive.Root className="group grid grid-cols-[32px_1fr] gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
        AI
      </div>
      <div className="min-w-0">
        <div className="prose prose-sm max-w-none text-foreground dark:prose-invert prose-pre:rounded-md prose-pre:border prose-pre:bg-muted">
          <MessagePrimitive.Parts
            components={{
              Text: MarkdownPart
            }}
          />
        </div>
        <div className="mt-1 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <ActionBarPrimitive.Root hideWhenRunning>
            <ActionBarPrimitive.Copy asChild>
              <TooltipIconButton tooltip="Copy response" className="h-7 w-7">
                <MessagePrimitive.If copied>
                  <Check />
                </MessagePrimitive.If>
                <MessagePrimitive.If copied={false}>
                  <Copy />
                </MessagePrimitive.If>
              </TooltipIconButton>
            </ActionBarPrimitive.Copy>
            <ActionBarPrimitive.Reload asChild>
              <TooltipIconButton tooltip="Regenerate" className="h-7 w-7">
                <RefreshCcw />
              </TooltipIconButton>
            </ActionBarPrimitive.Reload>
          </ActionBarPrimitive.Root>
        </div>
      </div>
    </MessagePrimitive.Root>
  );
}

function MarkdownPart() {
  return <MarkdownTextPrimitive />;
}

function UserMessage() {
  return (
    <MessagePrimitive.Root className="group ml-auto grid max-w-[85%] justify-items-end gap-1">
      <div className="rounded-lg bg-primary px-4 py-2 text-sm leading-6 text-primary-foreground">
        <MessagePrimitive.Parts />
      </div>
      <ActionBarPrimitive.Root
        hideWhenRunning
        className="flex opacity-0 transition-opacity group-hover:opacity-100"
      >
        <ActionBarPrimitive.Edit asChild>
          <TooltipIconButton tooltip="Edit" className="h-7 w-7">
            <Pencil />
          </TooltipIconButton>
        </ActionBarPrimitive.Edit>
      </ActionBarPrimitive.Root>
    </MessagePrimitive.Root>
  );
}

function Composer() {
  return (
    <ComposerPrimitive.Root className="mx-auto w-full max-w-3xl rounded-lg border bg-background p-2 shadow-sm transition-shadow focus-within:shadow-md">
      <ComposerPrimitive.AttachmentDropzone className="rounded-md data-[dragging=true]:bg-accent/10">
        <div className="flex min-h-24 flex-col gap-2">
          <ComposerPrimitive.Input
            rows={2}
            autoFocus
            placeholder="Send a message..."
            className="max-h-40 min-h-14 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
          />
          <div className="flex items-center justify-between">
            <ComposerPrimitive.AddAttachment asChild>
              <TooltipIconButton tooltip="Attach file" side="bottom" className="h-8 w-8">
                <Paperclip />
              </TooltipIconButton>
            </ComposerPrimitive.AddAttachment>
            <div className="flex items-center gap-1">
              <ThreadPrimitive.If running={false}>
                <ComposerPrimitive.Send asChild>
                  <Button size="icon" className="h-8 w-8 rounded-full">
                    <ArrowUp className="h-4 w-4" />
                    <span className="sr-only">Send</span>
                  </Button>
                </ComposerPrimitive.Send>
              </ThreadPrimitive.If>
              <ThreadPrimitive.If running>
                <ComposerPrimitive.Cancel asChild>
                  <Button size="icon" className="h-8 w-8 rounded-full">
                    <Square className="h-3 w-3 fill-current" />
                    <span className="sr-only">Stop</span>
                  </Button>
                </ComposerPrimitive.Cancel>
              </ThreadPrimitive.If>
            </div>
          </div>
        </div>
      </ComposerPrimitive.AttachmentDropzone>
    </ComposerPrimitive.Root>
  );
}
