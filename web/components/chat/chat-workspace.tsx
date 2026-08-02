"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import {
  Bell,
  Bot,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  Plus,
  Search,
  Settings,
  Sun
} from "lucide-react";
import dynamic from "next/dynamic";

import { RuntimeProvider } from "@/components/providers/runtime-provider";

const ProfessionalThreadComponent = dynamic(
  () => import("@/components/assistant-ui/professional-thread").then((m) => m.ProfessionalThread),
  { ssr: false }
);

function ProfessionalThread() {
  return (
    <RuntimeProvider>
      <ProfessionalThreadComponent />
    </RuntimeProvider>
  );
}
import { AuthPanel } from "@/components/chat/auth-panel";
import { ChatComposer } from "@/components/chat/chat-composer";
import { MessageList } from "@/components/chat/message-list";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/toast";
import {
  fetchChats,
  fetchMessages,
  readStoredProfile,
  sendMessage,
  writeStoredProfile
} from "@/lib/api/client";
import { chatDisplayName, initials } from "@/lib/chat-engine/messages";
import type { Attachment, AuthProfile, Chat, ChatMessage } from "@/lib/types/chat";

const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || undefined;

export function ChatWorkspace() {
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string>();
  const [hiddenMessageIds, setHiddenMessageIds] = useState<Set<string>>(new Set());
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
        title: "Unable to load chats",
        description: error instanceof Error ? error.message : "Try again.",
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
        setHiddenMessageIds(new Set());
        socketRef.current?.emit("join chat", chatId);
        requestAnimationFrame(scrollToBottom);
      } catch (error) {
        toast({
          title: "Unable to load messages",
          description: error instanceof Error ? error.message : "Try again.",
          variant: "destructive"
        });
      } finally {
        setLoadingMessages(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    setProfile(readStoredProfile());
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
          title: "New message",
          description: `${message.sender.name}: ${message.content.slice(0, 80)}`
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
      const message = await sendMessage({
        chatId: activeChat._id,
        content,
        attachments
      });
      setMessages((current) => [...current, message]);
      setChats((current) =>
        current.map((chat) => (chat._id === activeChat._id ? { ...chat, latestMessage: message } : chat))
      );
      socketRef.current?.emit("new message", message);
      requestAnimationFrame(scrollToBottom);
    } catch (error) {
      toast({
        title: "Message failed",
        description: error instanceof Error ? error.message : "Try again.",
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

  function handleRetry(message: ChatMessage) {
    toast({
      title: "Retry queued",
      description: `Regenerate can call your model layer later. Original: ${message.content.slice(0, 60)}`
    });
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
    socketRef.current?.disconnect();
  }

  return (
    <TooltipProvider>
      <main className="flex h-dvh min-h-[720px] bg-muted/35">
        <aside className="hidden w-80 shrink-0 border-r bg-background md:flex md:flex-col">
          <SidebarHeader profile={profile} onSignOut={handleSignOut} />
          <div className="border-b p-3">
            {profile ? (
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search conversations"
                  className="pl-9"
                />
              </div>
            ) : (
              <AuthPanel onAuthenticated={setProfile} />
            )}
          </div>
          <ChatList
            chats={filteredChats}
            activeChatId={activeChatId}
            currentUserId={profile?.result._id}
            loading={loadingChats}
            onSelect={setActiveChatId}
          />
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <TopBar
            activeChat={activeChat}
            currentUserId={profile?.result._id}
            profile={profile}
            onSignOut={handleSignOut}
          />
          <Tabs defaultValue="team" className="flex min-h-0 flex-1 flex-col">
            <div className="flex items-center justify-between border-b bg-background px-3 py-2">
              <TabsList>
                <TabsTrigger value="team">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Team chat
                </TabsTrigger>
                <TabsTrigger value="assistant">
                  <Bot className="mr-2 h-4 w-4" />
                  Assistant
                </TabsTrigger>
              </TabsList>
              <div className="hidden items-center gap-2 sm:flex">
                <Badge variant="muted">{typing ? "Typing..." : "Realtime ready"}</Badge>
                <SettingsDialog />
              </div>
            </div>
            <TabsContent value="team" className="m-0 flex min-h-0 flex-1 flex-col">
              {profile && activeChat ? (
                <>
                  <div
                    ref={viewportRef}
                    className="chat-scrollbar relative flex-1 overflow-y-auto p-4"
                    onScroll={(event) => {
                      const target = event.currentTarget;
                      setShowScrollLatest(
                        target.scrollHeight - target.scrollTop - target.clientHeight > 220
                      );
                    }}
                  >
                    {loadingMessages ? (
                      <div className="grid h-full place-items-center text-sm text-muted-foreground">
                        Loading messages...
                      </div>
                    ) : (
                      <MessageList
                        messages={messages}
                        currentUserId={profile.result._id}
                        hiddenMessageIds={hiddenMessageIds}
                        copiedMessageId={copiedMessageId}
                        onCopy={handleCopy}
                        onRetry={handleRetry}
                        onDelete={(messageId) =>
                          setHiddenMessageIds((current) => new Set(current).add(messageId))
                        }
                      />
                    )}
                    {showScrollLatest ? (
                      <Button
                        type="button"
                        size="sm"
                        className="sticky bottom-3 left-1/2 -translate-x-1/2 rounded-full shadow-lg"
                        onClick={scrollToBottom}
                      >
                        Latest
                      </Button>
                    ) : null}
                  </div>
                  <div className="border-t bg-background p-3">
                    <ChatComposer
                      sending={sending}
                      onSend={handleSend}
                      onTyping={() => socketRef.current?.emit("typing", activeChat._id)}
                      onStopTyping={() => socketRef.current?.emit("stop typing", activeChat._id)}
                    />
                  </div>
                </>
              ) : (
                <div className="grid flex-1 place-items-center p-6 text-center">
                  <div className="grid max-w-md gap-3">
                    <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground" />
                    <h1 className="text-xl font-semibold">Select or sign in to a chat</h1>
                    <p className="text-sm leading-6 text-muted-foreground">
                      The new workspace keeps your existing MongoDB chat sessions and socket.io events.
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
            <TabsContent value="assistant" className="m-0 min-h-0 flex-1">
              <ProfessionalThread />
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </TooltipProvider>
  );
}

function SidebarHeader({
  profile,
  onSignOut
}: {
  profile: AuthProfile | null;
  onSignOut: () => void;
}) {
  return (
    <div className="flex h-16 items-center justify-between border-b px-4">
      <div>
        <div className="text-sm font-semibold">Chat Engine</div>
        <div className="text-xs text-muted-foreground">Next workspace</div>
      </div>
      {profile ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile.result.pic ?? ""} alt={profile.result.name} />
                <AvatarFallback>{initials(profile.result.name)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{profile.result.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  );
}

function ChatList({
  chats,
  activeChatId,
  currentUserId,
  loading,
  onSelect
}: {
  chats: Chat[];
  activeChatId: string | null;
  currentUserId?: string;
  loading: boolean;
  onSelect: (chatId: string) => void;
}) {
  return (
    <div className="chat-scrollbar min-h-0 flex-1 overflow-y-auto p-2">
      {loading ? (
        <div className="grid gap-2">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-md bg-muted" />
          ))}
        </div>
      ) : (
        <div className="grid gap-1">
          {chats.map((chat) => (
            <button
              key={chat._id}
              type="button"
              onClick={() => onSelect(chat._id)}
              className={`grid grid-cols-[40px_1fr] gap-3 rounded-md p-2 text-left transition-colors hover:bg-muted ${
                activeChatId === chat._id ? "bg-muted" : ""
              }`}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={chat.users.find((user) => user._id !== currentUserId)?.pic ?? ""} />
                <AvatarFallback>{initials(getChatName(chat, currentUserId))}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium">{getChatName(chat, currentUserId)}</span>
                  {chat.isGroupChat ? <Badge variant="outline">Group</Badge> : null}
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {chat.latestMessage?.content ?? "Start a conversation"}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TopBar({
  activeChat,
  currentUserId,
  profile,
  onSignOut
}: {
  activeChat: Chat | null;
  currentUserId?: string;
  profile: AuthProfile | null;
  onSignOut: () => void;
}) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-3 sm:px-4">
      <div className="flex min-w-0 items-center gap-3">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <Avatar className="h-9 w-9">
          <AvatarImage src={activeChat?.users.find((user) => user._id !== currentUserId)?.pic ?? ""} />
          <AvatarFallback>{initials(activeChat ? getChatName(activeChat, currentUserId) : "CE")}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">
            {activeChat ? getChatName(activeChat, currentUserId) : "Chat Engine"}
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {activeChat ? `${activeChat.users.length} participant${activeChat.users.length === 1 ? "" : "s"}` : "Production workspace"}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Notifications</TooltipContent>
        </Tooltip>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{profile?.result.name ?? "Workspace"}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Sun className="mr-2 h-4 w-4" />
              Light mode
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Moon className="mr-2 h-4 w-4" />
              Dark mode
            </DropdownMenuItem>
            {profile ? (
              <DropdownMenuItem onClick={onSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function SettingsDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4" />
          New
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Workspace settings</DialogTitle>
          <DialogDescription>
            Group creation, profile editing, and provider configuration belong here as the migration continues.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

function getChatName(chat: Chat, currentUserId?: string) {
  if (chat.isGroupChat) return chat.chatName;
  return chatDisplayName(chat.users, currentUserId);
}

function getMessageChatId(message: ChatMessage) {
  return typeof message.chat === "string" ? message.chat : message.chat._id;
}
