"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import {
  ArrowLeft,
  Bot,
  LogOut,
  Menu,
  MessageCircle,
  Moon,
  Paperclip,
  Plus,
  Search,
  Sun,
  Users,
  X
} from "lucide-react";

import { AuthPanel } from "@/components/chat/auth-panel";
import { ChatComposer } from "@/components/chat/chat-composer";
import { MessageList } from "@/components/chat/message-list";
import { RuntimeProvider } from "@/components/providers/runtime-provider";
import { useTheme } from "@/components/providers/theme-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/toast";
import {
  accessChat,
  fetchChats,
  fetchMessages,
  readStoredProfile,
  searchUsers,
  sendMessage,
  writeStoredProfile
} from "@/lib/api/client";
import { chatDisplayName, initials } from "@/lib/chat-engine/messages";
import { cn } from "@/lib/utils";
import type { Attachment, AuthProfile, Chat, ChatMessage, User } from "@/lib/types/chat";

const AssistantThread = dynamic(
  () => import("@/components/assistant-ui/professional-thread").then((module) => module.ProfessionalThread),
  {
    ssr: false,
    loading: () => <AssistantLoading />
  }
);

function ProfessionalThread() {
  return (
    <RuntimeProvider>
      <AssistantThread />
    </RuntimeProvider>
  );
}

function AssistantLoading() {
  return (
    <div className="grid h-full place-items-center text-sm text-muted-foreground" role="status">
      Opening assistant...
    </div>
  );
}

type WorkspaceMode = "team" | "assistant";

const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || undefined;

export function ChatWorkspace() {
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>("team");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string>();
  const [showScrollLatest, setShowScrollLatest] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();

  const activeChat = useMemo(
    () => chats.find((chat) => chat._id === activeChatId) ?? null,
    [activeChatId, chats]
  );

  const filteredChats = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return chats;
    return chats.filter((chat) =>
      getChatName(chat, profile?.result._id).toLowerCase().includes(normalized)
    );
  }, [chats, profile?.result._id, query]);

  const loadChats = useCallback(async () => {
    if (!profile) return;
    setLoadingChats(true);
    try {
      const nextChats = await fetchChats();
      setChats(nextChats);
      setActiveChatId((current) => current ?? nextChats[0]?._id ?? null);
    } catch (error) {
      toast({
        title: "Could not load conversations",
        description: error instanceof Error ? error.message : "Refresh and try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingChats(false);
    }
  }, [profile, toast]);

  const loadMessages = useCallback(
    async (chatId: string) => {
      setLoadingMessages(true);
      try {
        const nextMessages = await fetchMessages(chatId);
        setMessages(nextMessages);
        socketRef.current?.emit("join chat", chatId);
        requestAnimationFrame(scrollToBottom);
      } catch (error) {
        toast({
          title: "Could not load messages",
          description: error instanceof Error ? error.message : "Select the conversation again.",
          variant: "destructive"
        });
      } finally {
        setLoadingMessages(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    const storedProfile = readStoredProfile();
    setProfile(storedProfile);
    if (storedProfile) setMobileSidebarOpen(true);
  }, []);

  useEffect(() => {
    void loadChats();
  }, [loadChats]);

  useEffect(() => {
    if (!activeChatId) {
      setMessages([]);
      return;
    }
    void loadMessages(activeChatId);
  }, [activeChatId, loadMessages]);

  useEffect(() => {
    if (!profile?.result) return;
    const socket = io(socketUrl);
    socketRef.current = socket;
    socket.emit("setup", profile.result);
    socket.on("typing", () => setTyping(true));
    socket.on("stop typing", () => setTyping(false));
    socket.on("message received", (message: ChatMessage) => {
      setChats((current) =>
        current.map((chat) =>
          chat._id === getMessageChatId(message) ? { ...chat, latestMessage: message } : chat
        )
      );
      if (getMessageChatId(message) === activeChatId) {
        setMessages((current) => [...current, message]);
        requestAnimationFrame(scrollToBottom);
      } else {
        toast({
          title: `New message from ${message.sender.name}`,
          description: message.content.slice(0, 80)
        });
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [activeChatId, profile?.result, toast]);

  async function handleSend(content: string, attachments: Attachment[]) {
    if (!activeChat) return;
    setSending(true);
    try {
      socketRef.current?.emit("stop typing", activeChat._id);
      const message = await sendMessage({ chatId: activeChat._id, content, attachments });
      setMessages((current) => [...current, message]);
      setChats((current) =>
        current.map((chat) => (chat._id === activeChat._id ? { ...chat, latestMessage: message } : chat))
      );
      socketRef.current?.emit("new message", message);
      requestAnimationFrame(scrollToBottom);
    } catch (error) {
      toast({
        title: "Message was not sent",
        description: error instanceof Error ? error.message : "Check your connection and try again.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  }

  async function handleCopy(message: ChatMessage) {
    await navigator.clipboard.writeText(message.content);
    setCopiedMessageId(message._id);
    window.setTimeout(() => setCopiedMessageId(undefined), 1500);
  }

  function scrollToBottom() {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
  }

  function handleSignOut() {
    writeStoredProfile(null);
    setProfile(null);
    setChats([]);
    setMessages([]);
    setActiveChatId(null);
    socketRef.current?.disconnect();
  }

  function selectChat(chatId: string) {
    setActiveChatId(chatId);
    setWorkspaceMode("team");
    setMobileSidebarOpen(false);
  }

  function selectAssistant() {
    setWorkspaceMode("assistant");
    setMobileSidebarOpen(false);
  }

  function handleChatCreated(chat: Chat) {
    setChats((current) => [chat, ...current.filter((item) => item._id !== chat._id)]);
    selectChat(chat._id);
  }

  if (!profile) {
    return (
      <TooltipProvider>
        <SignedOutExperience
          onAuthenticated={(authenticatedProfile) => {
            setProfile(authenticatedProfile);
            setMobileSidebarOpen(true);
          }}
        />
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <main className="relative flex h-dvh overflow-hidden bg-background">
      {mobileSidebarOpen ? (
        <button
          type="button"
          aria-label="Close conversations"
          className="fixed inset-0 z-30 bg-foreground/25 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      ) : null}

      <aside
        aria-label="Conversations"
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-full flex-col border-r bg-card shadow-[12px_0_30px_-24px_hsl(var(--foreground)/0.35)] transition-transform duration-200 ease-out md:static md:w-[22.5rem] md:translate-x-0 md:shadow-none",
          mobileSidebarOpen ? "visible translate-x-0" : "invisible -translate-x-full md:visible"
        )}
      >
        <SidebarHeader profile={profile} onClose={() => setMobileSidebarOpen(false)} onSignOut={handleSignOut} />

        <div className="border-b px-3 pb-3">
          <div className="flex items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search conversations"
                aria-label="Search conversations"
                className="h-11 rounded-xl border-transparent bg-muted pl-9 shadow-none focus-visible:border-primary/40"
              />
            </div>
            <NewChatDialog currentUserId={profile.result._id} onChatCreated={handleChatCreated} />
          </div>
        </div>

        <div className="border-b p-2">
          <button
            type="button"
            onClick={selectAssistant}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              workspaceMode === "assistant" && "bg-accent text-accent-foreground"
            )}
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
              <Bot className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">Chat Engine Assistant</span>
              <span className="block truncate text-xs text-muted-foreground">Ask, write, plan, or explore</span>
            </span>
            <Badge variant="muted" className="text-[10px]">AI</Badge>
          </button>
        </div>

        <div className="flex items-center justify-between px-4 pb-1 pt-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Messages</h2>
          <span className="text-xs tabular-nums text-muted-foreground">{chats.length}</span>
        </div>

        <ChatList
          chats={filteredChats}
          activeChatId={workspaceMode === "team" ? activeChatId : null}
          currentUserId={profile.result._id}
          loading={loadingChats}
          query={query}
          onSelect={selectChat}
        />
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <TopBar
          activeChat={workspaceMode === "team" ? activeChat : null}
          currentUserId={profile.result._id}
          mode={workspaceMode}
          typing={typing}
          onOpenSidebar={() => setMobileSidebarOpen(true)}
        />

        {workspaceMode === "assistant" ? (
          <div className="min-h-0 flex-1 bg-background">
            <ProfessionalThread />
          </div>
        ) : profile && activeChat ? (
          <>
            <div
              ref={viewportRef}
              className="chat-scrollbar chat-wallpaper relative min-h-0 flex-1 overflow-y-auto px-3 py-5 sm:px-6"
              onScroll={(event) => {
                const target = event.currentTarget;
                setShowScrollLatest(target.scrollHeight - target.scrollTop - target.clientHeight > 220);
              }}
            >
              <div className="mx-auto w-full max-w-4xl">
                {loadingMessages ? (
                  <div className="grid min-h-[50vh] place-items-center text-sm text-muted-foreground" role="status">
                    Loading messages...
                  </div>
                ) : (
                  <MessageList
                    messages={messages}
                    currentUserId={profile.result._id}
                    copiedMessageId={copiedMessageId}
                    onCopy={handleCopy}
                  />
                )}
              </div>
              {showScrollLatest ? (
                <Button
                  type="button"
                  size="icon"
                  className="sticky bottom-2 left-1/2 h-10 w-10 -translate-x-1/2 rounded-full shadow-[0_8px_24px_-10px_hsl(var(--foreground)/0.5)]"
                  onClick={scrollToBottom}
                >
                  <ArrowLeft className="h-4 w-4 -rotate-90" />
                  <span className="sr-only">Scroll to latest message</span>
                </Button>
              ) : null}
            </div>
            <div className="border-t bg-card px-3 py-2 sm:px-5 sm:py-3">
              <div className="mx-auto max-w-4xl">
                <ChatComposer
                  sending={sending}
                  onSend={handleSend}
                  onTyping={() => socketRef.current?.emit("typing", activeChat._id)}
                  onStopTyping={() => socketRef.current?.emit("stop typing", activeChat._id)}
                />
              </div>
            </div>
          </>
        ) : (
          <EmptyConversation onOpenSidebar={() => setMobileSidebarOpen(true)} />
        )}
      </section>
      </main>
    </TooltipProvider>
  );
}

function SignedOutExperience({ onAuthenticated }: { onAuthenticated: (profile: AuthProfile) => void }) {
  return (
    <div className="h-dvh overflow-y-auto bg-background">
      <header className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Brand />
        <ThemeToggle />
      </header>
      <main className="mx-auto grid min-h-[calc(100dvh-4rem)] max-w-7xl items-stretch lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-16 lg:py-16">
          <div className="max-w-xl">
            <div className="mb-8 grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[0_12px_30px_-16px_hsl(var(--primary)/0.8)]">
              <MessageCircle className="h-7 w-7" />
            </div>
            <h2 className="max-w-lg text-balance text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
              Your conversations, without the clutter.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">
              A familiar home for real-time team messages and focused work with your assistant.
            </p>
            <div className="mt-9 grid gap-4 text-sm sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <ProductFact icon={<MessageCircle />} title="Real-time chat" text="Continue direct and group conversations." />
              <ProductFact icon={<Paperclip />} title="File sharing" text="Send useful context with each message." />
              <ProductFact icon={<Bot />} title="Built-in assistant" text="Move from discussion to focused AI work." />
            </div>
          </div>
        </section>
        <section className="flex items-center justify-center border-t bg-card px-6 py-12 sm:px-10 lg:border-l lg:border-t-0 lg:px-16">
          <AuthPanel onAuthenticated={onAuthenticated} />
        </section>
      </main>
    </div>
  );
}

function ProductFact({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex gap-3 sm:block lg:flex xl:block">
      <span className="mb-3 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground [&_svg]:h-4 [&_svg]:w-4">
        {icon}
      </span>
      <div>
        <div className="font-semibold">{title}</div>
        <p className="mt-1 leading-5 text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
        <MessageCircle className="h-5 w-5" />
      </span>
      <div className="leading-tight">
        <div className="text-sm font-bold tracking-[-0.02em]">Chat Engine</div>
        <div className="text-[11px] text-muted-foreground">Messages + assistant</div>
      </div>
    </div>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";
  const label = dark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button type="button" variant="ghost" size="icon" aria-label={label} onClick={toggleTheme}>
          {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function SidebarHeader({
  profile,
  onClose,
  onSignOut
}: {
  profile: AuthProfile;
  onClose: () => void;
  onSignOut: () => void;
}) {
  return (
    <div className="flex h-[4.5rem] items-center justify-between px-4">
      <Brand />
      <div className="flex items-center gap-1">
        <Button type="button" variant="ghost" size="icon" className="md:hidden" onClick={onClose}>
          <X />
          <span className="sr-only">Close conversations</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open account menu" className="rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={profile.result.pic ?? ""} alt={profile.result.name} />
                <AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">
                  {initials(profile.result.name)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <span className="block truncate">{profile.result.name}</span>
              <span className="block truncate text-xs font-normal text-muted-foreground">{profile.result.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function ChatList({
  chats,
  activeChatId,
  currentUserId,
  loading,
  query,
  onSelect
}: {
  chats: Chat[];
  activeChatId: string | null;
  currentUserId: string;
  loading: boolean;
  query: string;
  onSelect: (chatId: string) => void;
}) {
  return (
    <div className="chat-scrollbar min-h-0 flex-1 overflow-y-auto px-2 pb-3">
      {loading ? (
        <div className="grid gap-1" role="status" aria-label="Loading conversations">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-[4.5rem] animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : chats.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <MessageCircle className="mx-auto h-8 w-8 text-muted-foreground/60" />
          <p className="mt-3 text-sm font-medium">{query ? "No conversations found" : "No conversations yet"}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {query ? "Try another name." : "Use the plus button to find someone."}
          </p>
        </div>
      ) : (
        <div className="grid gap-1">
          {chats.map((chat) => {
            const name = getChatName(chat, currentUserId);
            const otherUser = chat.users.find((user) => user._id !== currentUserId);
            const updatedAt = chat.latestMessage?.createdAt ?? chat.updatedAt;
            return (
              <button
                key={chat._id}
                type="button"
                onClick={() => onSelect(chat._id)}
                className={cn(
                  "grid min-h-[4.5rem] w-full grid-cols-[48px_1fr] gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  activeChatId === chat._id && "bg-accent text-accent-foreground"
                )}
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={otherUser?.pic ?? ""} alt={name} />
                  <AvatarFallback className="bg-secondary text-sm font-semibold">{initials(name)}</AvatarFallback>
                </Avatar>
                <span className="min-w-0 self-center">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-foreground">{name}</span>
                    {updatedAt ? (
                      <time className="shrink-0 text-[11px] tabular-nums text-muted-foreground" dateTime={updatedAt}>
                        {formatListTime(updatedAt)}
                      </time>
                    ) : null}
                  </span>
                  <span className="mt-1 flex items-center gap-1.5">
                    {chat.isGroupChat ? <Users className="h-3 w-3 shrink-0 text-muted-foreground" /> : null}
                    <span className="truncate text-xs text-muted-foreground">
                      {chat.latestMessage?.content ?? (chat.isGroupChat ? `${chat.users.length} members` : otherUser?.email ?? "Start a conversation")}
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TopBar({
  activeChat,
  currentUserId,
  mode,
  typing,
  onOpenSidebar
}: {
  activeChat: Chat | null;
  currentUserId: string;
  mode: WorkspaceMode;
  typing: boolean;
  onOpenSidebar: () => void;
}) {
  const assistant = mode === "assistant";
  const name = assistant ? "Chat Engine Assistant" : activeChat ? getChatName(activeChat, currentUserId) : "Messages";
  const otherUser = activeChat?.users.find((user) => user._id !== currentUserId);

  return (
    <header className="flex h-[4.5rem] shrink-0 items-center justify-between border-b bg-card px-3 sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label={assistant || activeChat ? "Back to conversations" : "Open conversations"}
          onClick={onOpenSidebar}
        >
          {assistant || activeChat ? <ArrowLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <Avatar className="h-10 w-10">
          {assistant ? null : <AvatarImage src={otherUser?.pic ?? ""} alt={name} />}
          <AvatarFallback className={cn("text-sm font-semibold", assistant && "bg-primary text-primary-foreground")}>
            {assistant ? <Bot className="h-5 w-5" /> : initials(name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold">{name}</h1>
          <p className={cn("truncate text-xs text-muted-foreground", typing && "text-primary")}>
            {assistant
              ? "Ready when you are"
              : typing
                ? "typing..."
                : activeChat
                  ? activeChat.isGroupChat
                    ? `${activeChat.users.length} members`
                    : "Conversation"
                  : "Choose a conversation"}
          </p>
        </div>
      </div>
      <ThemeToggle />
    </header>
  );
}

function NewChatDialog({
  currentUserId,
  onChatCreated
}: {
  currentUserId: string;
  onChatCreated: (chat: Chat) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [creatingId, setCreatingId] = useState<string>();
  const { toast } = useToast();

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const users = await searchUsers(query.trim());
      setResults(users.filter((user) => user._id !== currentUserId));
    } catch (error) {
      toast({
        title: "Could not search people",
        description: error instanceof Error ? error.message : "Try another search.",
        variant: "destructive"
      });
    } finally {
      setSearching(false);
    }
  }

  async function startConversation(user: User) {
    setCreatingId(user._id);
    try {
      const chat = await accessChat(user._id);
      if (!chat) throw new Error("The conversation could not be opened.");
      onChatCreated(chat);
      setOpen(false);
      setQuery("");
      setResults([]);
    } catch (error) {
      toast({
        title: "Could not start conversation",
        description: error instanceof Error ? error.message : "Try again.",
        variant: "destructive"
      });
    } finally {
      setCreatingId(undefined);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button type="button" size="icon" aria-label="New conversation" className="h-11 w-11 rounded-xl">
              <Plus className="h-5 w-5" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>New conversation</TooltipContent>
      </Tooltip>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Start a conversation</DialogTitle>
          <DialogDescription>Search by name or email, then choose a person to message.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name or email"
            aria-label="Find people by name or email"
            autoFocus
          />
          <Button type="submit" disabled={searching || !query.trim()}>
            {searching ? "Searching..." : "Search"}
          </Button>
        </form>
        <div className="chat-scrollbar max-h-80 overflow-y-auto">
          {results.length > 0 ? (
            <div className="grid gap-1">
              {results.map((user) => (
                <button
                  key={user._id}
                  type="button"
                  disabled={Boolean(creatingId)}
                  onClick={() => void startConversation(user)}
                  className="flex items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                >
                  <Avatar>
                    <AvatarImage src={user.pic ?? ""} alt={user.name} />
                    <AvatarFallback>{initials(user.name)}</AvatarFallback>
                  </Avatar>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{user.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
                  </span>
                  <span className="text-xs font-medium text-primary">
                    {creatingId === user._id ? "Opening..." : "Message"}
                  </span>
                </button>
              ))}
            </div>
          ) : query && !searching ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No people found yet.</p>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">Search to find someone new.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EmptyConversation({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  return (
    <div className="chat-wallpaper grid min-h-0 flex-1 place-items-center px-6 py-12 text-center">
      <div className="max-w-sm">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-card text-primary shadow-[0_12px_32px_-20px_hsl(var(--foreground)/0.45)]">
          <MessageCircle className="h-8 w-8" />
        </div>
        <h2 className="mt-6 text-xl font-bold tracking-[-0.025em]">Choose a conversation</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Select a recent message, start a new conversation, or open the assistant from the left.
        </p>
        <Button type="button" variant="outline" className="mt-5 md:hidden" onClick={onOpenSidebar}>
          <Menu />
          Open conversations
        </Button>
      </div>
    </div>
  );
}

function getChatName(chat: Chat, currentUserId?: string) {
  if (chat.isGroupChat) return chat.chatName;
  return chatDisplayName(chat.users, currentUserId);
}

function getMessageChatId(message: ChatMessage) {
  return typeof message.chat === "string" ? message.chat : message.chat._id;
}

function formatListTime(value: string) {
  const date = new Date(value);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) {
    return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date);
  }
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
}
