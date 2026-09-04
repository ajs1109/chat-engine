# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

People who want a familiar, low-friction place to sign up, sign in, find conversations, exchange real-time messages and attachments, and use an AI assistant from the same workspace.

## Product Purpose

Chat Engine brings the existing Express, MongoDB, and Socket.IO messaging backend into a responsive Next.js workspace. Success means a new user can create an account without hunting, an existing user can immediately find a conversation, and both can understand every primary control without documentation.

## Positioning

One workspace combines preserved real-time team conversations with a separate AI assistant while keeping the interaction model familiar to people who already use modern messaging products.

## Operating Context

The product is used as a full-height web messenger on desktop and mobile. Core tasks include account creation, authentication, conversation search and selection, real-time messaging, attachment upload, and assistant prompts.

## Capabilities and Constraints

- The Next.js web app must continue to use the existing Express API, MongoDB data, JWT authentication, and Socket.IO events.
- Azure App Service deployment and the current public domain must remain intact.
- Existing direct and group conversation data must remain compatible.
- The Assistant surface must stay isolated from the team-chat runtime so its dependencies cannot break normal messaging.
- The legacy client remains in the monorepo but is not the production interface being redesigned.

## Brand Commitments

- Product name: Chat Engine.
- The interface should feel immediately familiar to users of WhatsApp and Telegram without copying either product's branding or assets.
- Theme choice must be obvious, directly accessible, and persistent.

## Evidence on Hand

- Production Next.js interface in `app/` and `components/`.
- Existing Express controllers and routes for sign-up, login, user discovery, chats, groups, messages, and uploads.
- Existing live deployment at `chatengine.ajiteshsrivastava.com`.
- No approved testimonials, usage metrics, or commercial claims are available and none should be fabricated.

## Product Principles

- Familiar before novel: messaging conventions should reduce explanation and hesitation.
- Primary actions stay visible: account creation, theme switching, conversation selection, and message sending never hide behind ambiguous controls.
- Conversation first: chrome supports the active conversation instead of competing with it.
- Responsive by structure: mobile navigation should behave like a focused conversation list and thread, not a compressed desktop dashboard.
- Preserve working backend behavior while improving the interface around it.

## Accessibility & Inclusion

Controls require accessible names, visible keyboard focus, sufficient contrast in both themes, and layouts that remain usable at mobile widths and with reduced motion.
