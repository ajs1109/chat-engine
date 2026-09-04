"use client";

import Image from "next/image";
import { FileText, RotateCcw, X } from "lucide-react";
import type { Attachment } from "@/lib/types/chat";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type AttachmentPreviewProps = {
  attachment: Attachment;
  onRemove?: () => void;
  onRetry?: () => void;
};

export function AttachmentPreview({ attachment, onRemove, onRetry }: AttachmentPreviewProps) {
  const isImage = attachment.type.startsWith("image/");
  const tile = (
    <div className="relative flex h-16 min-w-52 max-w-72 items-center gap-3 rounded-md border bg-muted/40 p-2">
      {isImage ? (
        <div className="relative h-12 w-12 overflow-hidden rounded-md bg-background">
          <Image src={attachment.url} alt={attachment.name} fill className="object-cover" unoptimized />
        </div>
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-background">
          <FileText className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{attachment.name}</div>
        <div className="text-xs text-muted-foreground">{formatBytes(attachment.size)}</div>
        {attachment.status === "uploading" ? <Progress value={58} className="mt-2" /> : null}
        {attachment.status === "failed" ? (
          <div className="mt-1 text-xs text-destructive">Upload failed</div>
        ) : null}
      </div>
      {onRetry && attachment.status === "failed" ? (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          aria-label={`Retry uploading ${attachment.name}`}
          onClick={onRetry}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      ) : null}
      {onRemove ? (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          aria-label={`Remove ${attachment.name}`}
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );

  if (!isImage || attachment.status !== "ready") {
    return tile;
  }

  return (
    <Dialog>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>{tile}</DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>Open preview</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent className="max-w-4xl p-2">
        <DialogTitle className="sr-only">{attachment.name}</DialogTitle>
        <div className="relative h-[70dvh] overflow-hidden rounded-md bg-muted">
          <Image src={attachment.url} alt={attachment.name} fill className="object-contain" unoptimized />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
