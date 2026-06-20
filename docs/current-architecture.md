# Current Architecture

## Runtime and Entrypoints

The repository currently has two independently built apps:

- `server/` is an Express 4 application started from `server/index.js`.
- `client/` is a Vite React application started from `client/src/main.tsx`.

The server connects to MongoDB through `CONNECTION_URL`, requires `JWT_SECRET` for auth, and defaults to port `5000`. It exposes REST endpoints and a socket.io server from the same HTTP server.

## Backend APIs

User routes live in `server/routes/users.js`:

- `POST /user/login` authenticates with email/password and returns `{ result, token }`.
- `POST /user/signup` creates a user and accepts a multer `pic` profile upload.
- `GET /user/findUsers` searches users with JWT auth.

Chat routes live in `server/routes/chats.js`:

- `POST /chat/createChat` creates or returns a direct chat.
- `GET /chat/fetchChats` returns chats for the authenticated user.
- `POST /chat/createGroupChat` creates a group chat.
- `PUT /chat/renameGroup`, `/removeFromGroup`, and `/deleteGroup` mutate group membership.

Message routes live in `server/routes/messages.js`:

- `GET /messages/getMessages/:chatId` returns messages for a chat if the user belongs to it.
- `POST /messages/sendMessage` creates a message, populates sender/chat/users, and updates `latestMessage`.

## Message Flow

The Vite client stores the auth payload in local storage under `profile`. `client/src/axios/axios.ts` attaches the JWT to API calls. Chat selection is held in Redux via `activeChat`, and `ChatBox.tsx` loads messages for the selected chat.

Realtime delivery uses socket.io events:

- `setup` joins the authenticated user's personal room.
- `join chat` joins the current chat room.
- `typing` and `stop typing` broadcast typing state to the room.
- `new message` emits a newly created message to every user in the chat except the sender.
- `message received` is consumed by the client to append active-chat messages or add notifications.

## Data Model

MongoDB models are in `server/models`:

- `User`: name, email, hashed password, and profile picture.
- `Chat`: chat name, group flag, users, latest message, and group admin.
- `Message`: sender, content, chat, timestamps, and optional attachments added during the Next migration.

## Existing Uploads

The original backend only handles profile-picture uploads through multer to `server/uploads/profilePicture`. Chat message attachments were not present before this migration, so the Next app introduces a separate upload endpoint and stores message attachment metadata on the message document.

## Dependencies to Preserve

The migration must preserve:

- Express route semantics and response shapes used by the existing client.
- MongoDB/Mongoose models and indexes.
- JWT auth behavior.
- socket.io event names and room semantics.
- Existing profile-picture URL behavior under `/uploads`.
