"use client";

import type { ReactNode } from "react";
import {
  AssistantRuntimeProvider,
  useLocalRuntime,
  type ChatModelAdapter
} from "@assistant-ui/react";

const chatEngineAssistantAdapter: ChatModelAdapter = {
  async *run({ messages, abortSignal }) {
    const lastUserText = messages
      .filter((message) => message.role === "user")
      .at(-1)
      ?.content.filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("\n");

    const response = await fetch("/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: lastUserText ?? "", messages }),
      signal: abortSignal
    });

    if (!response.ok || !response.body) {
      throw new Error("Assistant request failed");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let text = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      text += decoder.decode(value, { stream: true });
      yield {
        content: [{ type: "text", text }]
      };
    }
  }
};

export function RuntimeProvider({ children }: Readonly<{ children: ReactNode }>) {
  const runtime = useLocalRuntime(chatEngineAssistantAdapter);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}
