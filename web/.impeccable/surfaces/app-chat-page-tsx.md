---
version: 1
slug: "app-chat-page-tsx"
primary_target: "app/chat/page.tsx"
related_targets: ["components/chat/chat-workspace.tsx","components/chat/auth-panel.tsx"]
---

## Scope and mode

- Route: `/chat`
- Mode: Operate

## Audience and task

New and returning Chat Engine users need to authenticate, find a conversation or the assistant, and communicate without learning unfamiliar navigation.

## Required actions and content

- Keep Sign in and Create account equally discoverable before authentication.
- Keep the light/dark toggle directly visible with an accessible action label.
- Treat the assistant as a special conversation rather than a competing application mode.
- Preserve conversation search, real-time messages, attachments, account access, and mobile navigation.

## Constraints

The existing Express, MongoDB, JWT, Socket.IO, assistant runtime, and Azure deployment architecture must remain compatible. Do not imitate WhatsApp or Telegram branding or proprietary assets.

## Chosen direction

A familiar messenger canon: one dense conversation rail beside one dominant thread, compact circular identity marks, restrained sky-blue action color, calm white/ink surfaces, and message bubbles with clear ownership and timestamps.

## Memorable moment

The assistant appears exactly where users expect another conversation to be; switching from a person to AI requires no new navigation model.

## Unresolved decisions

No product-specific decision has been made about group-creation UI or richer profile editing.
