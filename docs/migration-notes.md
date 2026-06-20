# Migration Notes

## New Files

- Added root `package.json` with workspaces for `client`, `server`, and `web`.
- Added `web/` Next.js 14 App Router project with TypeScript, Tailwind, ESLint, shadcn config, and `.env.example`.
- Added `web/app/chat/page.tsx` and root redirect from `/` to `/chat`.
- Added proxy API routes for login, chats, group actions, messages, uploads, and assistant streaming.
- Added shadcn-style UI primitives under `web/components/ui`.
- Added chat workspace components under `web/components/chat`.
- Added assistant-ui runtime/provider and thread components under `web/components/assistant-ui` and `web/components/providers`.
- Added typed API and domain modules under `web/lib`.
- Added `docs/current-architecture.md` and `docs/next-architecture.md`.

## Changed Existing Files

- `server/models/messageModel.js`: added optional `attachments` metadata array.
- `server/controllers/messageController.js`: accepts optional attachments and allows attachment-only messages.

## Preserved Backend Contracts

- Existing Express route paths remain intact.
- Existing JWT auth middleware remains the source of authorization.
- Existing MongoDB chat/user/message collections remain the system of record.
- Existing socket.io events remain unchanged: `setup`, `join chat`, `typing`, `stop typing`, `new message`, and `message received`.

## How to Run

1. Start the existing backend from `server/`.
2. Copy `web/.env.example` to `web/.env` and update URLs if needed.
3. Install the new web dependencies.
4. Run `npm --workspace web run dev` from the repo root.

## Review Notes

The repository had many pre-existing modified files before this migration. This work avoided rewriting the old Vite client and only extended the backend where message attachments needed persistence.
