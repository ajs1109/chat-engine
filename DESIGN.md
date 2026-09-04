---
name: Chat Engine
description: A calm, familiar messenger for people and an AI assistant.
colors:
  messenger-blue: "hsl(202 88% 34%)"
  message-blue: "hsl(202 82% 34%)"
  paper: "hsl(210 25% 98%)"
  white-surface: "hsl(0 0% 100%)"
  ink: "hsl(216 30% 14%)"
  muted-ink: "hsl(215 12% 43%)"
  night: "hsl(222 28% 9%)"
  night-surface: "hsl(220 24% 13%)"
  hairline: "hsl(212 18% 88%)"
typography:
  display:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.04em"
  body:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "0.08em"
rounded:
  control: "0.75rem"
  bubble: "0.875rem"
  compact: "0.5rem"
  circle: "9999px"
spacing:
  tight: "0.5rem"
  control: "0.75rem"
  section: "1.5rem"
components:
  button-primary:
    backgroundColor: "{colors.messenger-blue}"
    textColor: "{colors.white-surface}"
    rounded: "{rounded.control}"
    height: "2.75rem"
    padding: "0.75rem 1rem"
  input-search:
    backgroundColor: "hsl(210 22% 95%)"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "2.75rem"
    padding: "0.75rem"
  message-sent:
    backgroundColor: "{colors.message-blue}"
    textColor: "{colors.white-surface}"
    rounded: "{rounded.bubble}"
    padding: "0.5rem 0.875rem"
---

# Design System: Chat Engine

## Overview

**Creative North Star: "The Familiar Messenger"**

Chat Engine should disappear behind the conversation. Its interface uses recognizable messenger structure, calm surfaces, compact controls, and one restrained blue accent so users can sign in, find a person, or open the assistant without learning a dashboard.

The system takes familiarity from modern messaging products without copying their brand assets. Desktop pairs a dense conversation rail with one dominant thread; mobile presents the list and thread as separate full-width panes. The assistant participates in the same navigation model as a special conversation.

**Key Characteristics:**

- Conversation-first hierarchy with minimal chrome.
- Restrained blue actions against paper-white or ink-dark surfaces.
- Compact rounded controls, circular identity marks, and calm asymmetric bubbles.
- Equivalent light and dark modes with obvious, persistent switching.
- One-pane-at-a-time mobile navigation.

## Colors

The palette uses cool paper and ink neutrals with messenger blue reserved for action, selection, and sent-message ownership.

### Primary

- **Messenger Blue:** Primary buttons, selected identity marks, links, and focus emphasis.
- **Message Blue:** Sent-message bubbles; it is deliberately deep enough for white message text.

### Neutral

- **Cool Paper:** The light application canvas and subtle message wallpaper.
- **White Surface:** Navigation, composer, dialog, and incoming-message surfaces in light mode.
- **Clear Ink:** Primary text and high-contrast iconography.
- **Muted Ink:** Supporting labels, timestamps, and inactive controls.
- **Night Canvas:** The dark application canvas and wallpaper.
- **Night Surface:** Dark navigation, incoming-message, and composer surfaces.
- **Hairline:** Quiet boundaries between persistent regions.

**The One Accent Rule.** Blue communicates action, selection, or message ownership; it is not general decoration.

**The Theme Parity Rule.** Every surface and state must remain legible and structurally identical in light and dark modes.

## Typography

**Display Font:** Manrope (with ui-sans-serif and system fallbacks)  
**Body Font:** Manrope (with ui-sans-serif and system fallbacks)

**Character:** Manrope keeps the product contemporary and legible at messenger density. Hierarchy comes from weight, scale, and restrained tracking rather than a second decorative family.

### Hierarchy

- **Display** (700, responsive 2.25–3rem, 1.05): Authentication and onboarding statements only.
- **Headline** (700, 1.25–1.5rem): Empty-state and assistant prompts.
- **Title** (600–700, 0.875–1rem): Conversation names, product identity, and dialog titles.
- **Body** (400, 0.875rem, 1.5): Messages, descriptions, and form content.
- **Label** (600, 0.75rem, 0.08em): Short uppercase section labels such as the message-list heading.

**The Quiet Hierarchy Rule.** Repeated conversation UI stays compact; display scale belongs only to onboarding or true empty states.

## Layout

The authenticated desktop shell fills the dynamic viewport. A fixed 22.5rem conversation rail sits beside a flexible thread, whose readable content is capped at 64rem. Toolbars use a 4.5rem height and composers remain pinned to the bottom.

At widths below 768px, the conversation list becomes a full-width pane. Choosing a conversation replaces it with the thread, whose leading arrow returns to the list. Authentication stacks vertically until the large breakpoint, where product context and the account form share the viewport.

Spacing follows a compact 0.5rem control rhythm, 0.75rem internal control spacing, and 1.5rem section rhythm. Chat content gains modest horizontal padding as the viewport grows.

## Elevation & Depth

The system is flat by default and uses hairline borders plus tonal changes to establish persistent regions. Small ambient shadows lift message bubbles, menus, dialogs, and transient controls without turning the interface into a card grid.

### Shadow Vocabulary

- **Bubble lift** (`0 2px 8px -5px hsl(var(--foreground) / 0.5)`): Separates message bubbles from the patterned conversation canvas.
- **Floating control** (`0 8px 24px -10px hsl(var(--foreground) / 0.5)`): Used only for transient controls such as scroll-to-latest.

**The Flat Shell Rule.** Persistent navigation and thread regions use borders and tonal layering; shadows are reserved for content or controls that visually float.

## Shapes

Controls and navigation rows use gently rounded 0.75rem corners. Message bubbles use 0.875rem corners with one 0.25rem tail-side corner to communicate ownership. Avatars and compact identity controls are fully circular. Avoid ornamental geometry and oversized pill-shaped containers.

## Components

### Buttons

- **Shape:** Compact rounded controls (0.75rem), with icon-only identity and utility buttons allowed to be circular.
- **Primary:** Messenger blue with white content and a minimum 2.75rem control height.
- **Hover / Focus:** Small tonal shifts and a visible two-pixel focus ring; controls never rely on tooltip text as their accessible name.
- **Ghost:** Transparent at rest, with a quiet neutral hover surface.

### Cards / Containers

- **Corner Style:** Use modest rounded surfaces only where content is genuinely grouped.
- **Background:** White surface in light mode and night surface in dark mode.
- **Shadow Strategy:** Flat persistent regions; ambient lift only for overlays and bubbles.
- **Border:** Hairline borders separate stable regions.

### Inputs / Fields

- **Style:** Compact fields with quiet neutral fills or hairline borders and 0.75rem corners.
- **Focus:** A clear primary-colored ring or border shift.
- **Error / Disabled:** Destructive red is reserved for actionable errors; disabled actions remain visible but subdued.

### Navigation

Conversation rows combine a circular avatar, strong single-line name, compact time, and one-line preview. Selection uses a tonal blue surface. The assistant is a pinned special row, not a separate dashboard tab. Mobile navigation uses full-pane replacement and a back arrow.

### Message Bubble

Incoming bubbles use the raised neutral surface; sent bubbles use Message Blue with white text. Width stays content-led up to roughly three quarters of the desktop thread and 88% on mobile. Timestamps sit inside the bubble. Secondary actions overlay on hover or keyboard focus and never reserve vertical space.

### Theme Toggle

The toggle is always directly visible. A moon indicates the action to enter dark mode; a sun indicates the action to enter light mode. The accessible name describes the action, and the preference persists across reloads.

## Do's and Don'ts

### Do:

- **Do** keep sign-in, account creation, theme switching, conversation selection, and sending immediately discoverable.
- **Do** preserve the two-pane desktop and one-pane mobile messenger model.
- **Do** use semantic icon labels, visible keyboard focus, sufficient contrast, and reduced-motion support.
- **Do** keep the assistant inside the conversation list while isolating its runtime behavior.

### Don't:

- **Don't** hide primary actions in a gear menu or ambiguous overflow control.
- **Don't** reintroduce dashboard tabs, decorative cards, or competing chrome around the active conversation.
- **Don't** expose placeholder message actions such as no-op retry or client-only destructive hide.
- **Don't** copy WhatsApp or Telegram branding, proprietary assets, or signature colors literally.
