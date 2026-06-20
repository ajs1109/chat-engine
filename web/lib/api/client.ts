import type { ApiResult, Attachment, AuthProfile, Chat, ChatMessage } from "@/lib/types/chat";

const PROFILE_KEY = "profile";

export function readStoredProfile(): AuthProfile | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthProfile;
  } catch {
    return null;
  }
}

export function writeStoredProfile(profile: AuthProfile | null) {
  if (typeof window === "undefined") return;
  if (!profile) {
    window.localStorage.removeItem(PROFILE_KEY);
    return;
  }
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const profile = readStoredProfile();
  const response = await fetch(path, {
    ...init,
    headers: {
      ...(init.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(profile?.token ? { authorization: `Bearer ${profile.token}` } : {}),
      ...init.headers
    }
  });
  const payload = (await response.json()) as ApiResult<T>;
  if (!payload.ok) {
    throw new Error(payload.error.message);
  }
  return payload.data;
}

export function login(email: string, password: string) {
  return apiFetch<AuthProfile>("/api/user/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

export function fetchChats() {
  return apiFetch<Chat[]>("/api/chat/fetch");
}

export function fetchMessages(chatId: string) {
  return apiFetch<ChatMessage[]>(`/api/messages/${chatId}`);
}

export function sendMessage(input: {
  chatId: string;
  content: string;
  attachments?: Attachment[];
}) {
  return apiFetch<ChatMessage>("/api/messages", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function uploadAttachment(file: File) {
  const form = new FormData();
  form.append("file", file);
  return apiFetch<Attachment>("/api/upload", {
    method: "POST",
    body: form
  });
}
