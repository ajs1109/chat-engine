# Next Architecture

## Package Layout

The new Next.js app lives in `web/` and is wired as a workspace from the repository root.

- `web/app/` contains App Router pages and route handlers.
- `web/components/chat/` contains the production chat workspace, message list, composer, auth panel, and attachment preview UI.
- `web/components/assistant-ui/` contains assistant-ui integration pieces.
- `web/components/ui/` contains shadcn-style primitives.
- `web/lib/chat-engine/` contains server env parsing, proxy helpers, and message-format helpers.
- `web/lib/api/` contains the typed browser API client.
- `web/lib/types/` contains shared Zod schemas and TypeScript types.

## Routes

The browser talks to typed Next route handlers first:

- `POST /api/user/login` proxies `POST /user/login`.
- `GET /api/chat/fetch` proxies `GET /chat/fetchChats`.
- `POST /api/chat/access` proxies `POST /chat/createChat`.
- `POST /api/chat/groups` proxies group creation.
- `PATCH /api/chat/groups` routes group actions to the existing Express endpoints.
- `GET /api/messages/:chatId` proxies `GET /messages/getMessages/:chatId`.
- `POST /api/messages` validates content and attachments, then proxies `POST /messages/sendMessage`.
- `POST /api/upload` validates file type/size and writes files to `web/public/uploads/chat`.
- `POST /api/assistant` streams a small text response used by the assistant-ui runtime.

All route handlers return a consistent envelope:

```json
{ "ok": true, "data": {} }
```

or:

```json
{ "ok": false, "error": { "code": "CODE", "message": "Readable message" } }
```

## Chat UI

`web/app/chat/page.tsx` renders `ChatWorkspace`, a responsive SaaS-style chat shell with:

- Left conversation list, search, user menu, and auth panel.
- Topbar with active chat identity, notifications, and settings menu.
- Message grouping by sender and timestamp.
- Markdown rendering with GFM support.
- Copy, retry, and soft-hide message actions.
- Drag-and-drop uploads, image previews, document tiles, upload progress, and upload error toasts.
- socket.io typing and new-message events using the preserved backend event names.

## assistant-ui Integration

The app wraps all pages in `RuntimeProvider`, which uses `@assistant-ui/react` `useLocalRuntime`. The `ProfessionalThread` component uses assistant-ui primitives for an AI-style thread with composer, scroll-to-bottom, copy, edit, regenerate, attachment button, and cancellation controls.

This is intentionally separate from the preserved human chat backend. The human chat continues using MongoDB chats/messages, while the assistant-ui runtime gives the app a production-ready path for model/provider integrations.

## Adding Providers

To add a real model/provider:

1. Replace `web/app/api/assistant/route.ts` with a provider call that streams cumulative text.
2. Keep passing `abortSignal` from the `ChatModelAdapter`.
3. Add provider env vars to `web/.env.example`.
4. If provider messages need conversion, add helpers under `web/lib/chat-engine/`.

## Adding Chat Features

New chat features should start in typed modules:

1. Add or extend schemas in `web/lib/types/chat.ts`.
2. Add server behavior in `server/controllers` and `server/models` only when persistence changes.
3. Add a Next route handler in `web/app/api`.
4. Consume it through `web/lib/api/client.ts`.
5. Build UI in `web/components/chat`.
