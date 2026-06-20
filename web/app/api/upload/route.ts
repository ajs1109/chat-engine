import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { type NextRequest } from "next/server";
import { serverEnv } from "@/lib/chat-engine/env";
import { jsonError, jsonOk } from "@/lib/chat-engine/http";
import type { Attachment } from "@/lib/types/chat";

export const runtime = "nodejs";

const allowedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);

function safeExtension(name: string) {
  const ext = path.extname(name).toLowerCase().replace(/[^a-z0-9.]/g, "");
  return ext || ".bin";
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return jsonError("UPLOAD_FILE_REQUIRED", "A file is required", 400);
  }

  if (file.size > serverEnv.UPLOAD_MAX_BYTES) {
    return jsonError("UPLOAD_TOO_LARGE", "File exceeds the configured size limit", 413);
  }

  if (!allowedTypes.has(file.type)) {
    return jsonError("UPLOAD_TYPE_UNSUPPORTED", "This file type is not supported", 415);
  }

  const id = randomUUID();
  const fileName = `${id}${safeExtension(file.name)}`;
  const relativeUrl = `/uploads/chat/${fileName}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "chat");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, fileName), Buffer.from(await file.arrayBuffer()));

  const attachment: Attachment = {
    id,
    name: file.name,
    size: file.size,
    type: file.type,
    url: relativeUrl,
    status: "ready"
  };

  return jsonOk(attachment, { status: 201 });
}
