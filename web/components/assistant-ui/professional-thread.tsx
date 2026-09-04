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
  Bot,
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
    <ThreadPrimitive.Root className="flex h-full min-h-0 flex-col bg-background">
      <ThreadPrimitive.Viewport className="chat-scrollbar chat-wallpaper flex flex-1 flex-col overflow-y-auto px-3 sm:px-6">
        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 py-6">
          <ThreadPrimitive.Empty>
            <div className="m-auto grid max-w-md gap-4 px-4 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[0_12px_32px_-20px_hsl(var(--foreground)/0.45)]">
                <Bot className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold tracking-[-0.03em]">How can I help?</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Ask a question, develop an idea, or work through a task. Your team conversations stay separate.
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
        <div className="sticky bottom-0 pb-3 pt-2">
          <ThreadPrimitive.ScrollToBottom asChild>
            <TooltipIconButton
              tooltip="Scroll to latest"
              className="mx-auto mb-2 hidden rounded-full bg-card shadow-[0_4px_16px_-8px_hsl(var(--foreground)/0.45)] data-[visible=true]:flex"
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
    <MessagePrimitive.Root className="group grid grid-cols-[36px_1fr] gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Bot className="h-4 w-4" />
      </div>
      <div className="relative min-w-0">
        <div className="prose prose-sm max-w-none rounded-[14px] rounded-bl-[4px] bg-[hsl(var(--message-incoming))] px-4 py-3 text-foreground shadow-[0_2px_8px_-5px_hsl(var(--foreground)/0.5)] dark:prose-invert prose-pre:rounded-md prose-pre:bg-muted">
          <MessagePrimitive.Parts
            components={{
              Text: MarkdownPart
            }}
          />
        </div>
        <div className="pointer-events-none absolute left-0 top-full z-10 mt-0.5 flex items-center gap-1 rounded-lg border bg-popover p-0.5 opacity-0 shadow-sm transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
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
    <MessagePrimitive.Root className="group relative ml-auto grid max-w-[85%] justify-items-end">
      <div className="rounded-[14px] rounded-br-[4px] bg-[hsl(var(--message-sent))] px-4 py-2.5 text-sm leading-6 text-white shadow-[0_2px_8px_-5px_hsl(var(--foreground)/0.5)]">
        <MessagePrimitive.Parts />
      </div>
      <ActionBarPrimitive.Root
        hideWhenRunning
        className="pointer-events-none absolute right-0 top-full z-10 mt-0.5 flex rounded-lg border bg-popover p-0.5 opacity-0 shadow-sm transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100"
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
    <ComposerPrimitive.Root className="mx-auto w-full max-w-4xl rounded-[14px] bg-card p-1.5 shadow-[0_8px_28px_-18px_hsl(var(--foreground)/0.55)]">
      <ComposerPrimitive.AttachmentDropzone className="rounded-xl data-[dragging=true]:bg-accent">
        <div className="flex min-h-12 items-end gap-1">
          <ComposerPrimitive.AddAttachment asChild>
            <TooltipIconButton tooltip="Attach file" side="bottom" className="h-10 w-10 shrink-0 rounded-xl text-muted-foreground">
              <Paperclip />
            </TooltipIconButton>
          </ComposerPrimitive.AddAttachment>
          <ComposerPrimitive.Input
            rows={1}
            autoFocus
            placeholder="Message the assistant"
            className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
          />
          <div className="flex items-center self-end">
              <ThreadPrimitive.If running={false}>
                <ComposerPrimitive.Send asChild>
                  <Button size="icon" className="h-10 w-10 rounded-xl">
                    <ArrowUp className="h-4 w-4" />
                    <span className="sr-only">Send</span>
                  </Button>
                </ComposerPrimitive.Send>
              </ThreadPrimitive.If>
              <ThreadPrimitive.If running>
                <ComposerPrimitive.Cancel asChild>
                  <Button size="icon" className="h-10 w-10 rounded-xl">
                    <Square className="h-3 w-3 fill-current" />
                    <span className="sr-only">Stop</span>
                  </Button>
                </ComposerPrimitive.Cancel>
              </ThreadPrimitive.If>
          </div>
        </div>
      </ComposerPrimitive.AttachmentDropzone>
    </ComposerPrimitive.Root>
  );
}
