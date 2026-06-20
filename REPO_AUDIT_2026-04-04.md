# Chat Engine Audit Report

Date: 2026-04-04
Repository: chat-engine
Branch reviewed: main
Scope: backend, frontend, MongoDB integration, run/readiness checks

## 1. Executive Summary

Current status: NOT production-safe.

What works:
- Frontend production build succeeds.
- Basic project structure is coherent (React + Vite client, Express + Mongoose server, socket.io for realtime chat).

What blocks a "healthy" status:
- Critical authentication/security issues in backend (plaintext passwords, hardcoded JWT secret, unprotected message reads).
- MongoDB credentials are stored in server environment file in plaintext.
- Frontend has multiple runtime risks (effect loops, duplicated socket listeners, mixed local vs deployed URL usage).
- Lint quality is poor (29 errors, 9 warnings).
- Dependency vulnerability counts are high in both client and server dependency trees.

## 2. Verification Performed

Commands executed:
- server dependency install
- client dependency install
- client build
- client lint
- server startup

Observed outcomes:
- Initial npm install failed due local npm cache ownership permissions (EACCES).
- Re-ran install using local cache path and both installs succeeded.
- Client build: success.
- Client lint: failed with 29 errors and 9 warnings.
- Server runtime start: failed to resolve MongoDB SRV host in current environment (querySrv ENOTFOUND for cluster hostname).

Dependency audit counts from install output:
- server: 22 vulnerabilities (4 low, 3 moderate, 14 high, 1 critical)
- client: 29 vulnerabilities (11 moderate, 16 high, 2 critical)

## 3. MongoDB Assessment

### 3.1 Connection and Runtime
- Server reads CONNECTION_URL from environment and calls mongoose.connect() directly.
- No explicit connect timeout, serverSelection timeout, retry strategy, or graceful shutdown handling.
- In this environment, DNS/SRV resolution failed for cluster host, so server did not boot.

### 3.2 Data Model and Schema Safety
- User model lacks unique index on email and schema-level validation constraints for normalized email and password policy.
- Chat and Message models do not define indexes for commonly queried fields (users, chat, updatedAt), which can degrade performance at scale.
- No schema validation for required fields in messages/chats beyond basic type checks.

### 3.3 Security of DB Credentials
- Plaintext DB connection string is present in server env file (local file is ignored by server .gitignore, but still sensitive and should be rotated if ever leaked).

## 4. Backend Findings (Prioritized)

## Critical
1. Plaintext password storage and comparison.
- Evidence:
  - server/controllers/usersController.js line 10 compares raw password directly.
  - server/controllers/usersController.js line 39 stores password as provided.
- Risk: full account compromise if DB is exposed; no password hashing best practices.
- Fix: use bcrypt (hash on signup, compare on login), enforce password policy.

2. Hardcoded JWT secret in auth flow.
- Evidence:
  - server/controllers/usersController.js line 19 and line 51 use "test" secret.
  - server/Middleware/authMiddleware.js line 16 verifies with "test".
- Risk: token forgery and privilege escalation.
- Fix: move to JWT_SECRET environment variable, rotate secret, invalidate existing tokens.

3. Message retrieval route is unauthenticated.
- Evidence:
  - server/routes/messages.js line 8 exposes getMessages without auth middleware.
- Risk: unauthorized reads of private chats via guessed chat IDs.
- Fix: add auth middleware and membership check in controller.

## High
4. Auth middleware does not return explicit unauthorized when token missing.
- Evidence:
  - server/Middleware/authMiddleware.js has no else branch for missing/invalid auth header.
- Risk: hanging requests / inconsistent behavior.
- Fix: return 401 for missing bearer token before exiting middleware.

5. CORS/socket origin config is inconsistent and hardcoded.
- Evidence:
  - server/index.js line 34 allows only http://localhost:5173 for socket origin.
  - app-level cors() has permissive defaults.
- Risk: deployment mismatch and avoidable attack surface.
- Fix: centralize allowed origins via environment and restrict both HTTP and socket CORS.

6. Token lifetime inconsistency.
- Evidence:
  - signup token expires in 365d; login token expires in 2h.
- Risk: long-lived tokens increase compromise window.
- Fix: standardize to shorter access token + refresh token flow.

## Medium
7. Incomplete error status handling.
- Evidence:
  - server/controllers/messageController.js catch in getMessages returns status 200 with error payload.
- Risk: hides failures from client and monitoring.
- Fix: return 4xx/5xx as appropriate.

8. Group management logic trusts client-provided activeChat payload.
- Evidence:
  - server/controllers/chatController.js deleteGroup uses activeChat object from request body for admin checks.
- Risk: tampering and inconsistent authorization decisions.
- Fix: fetch authoritative chat doc from DB by ID and validate server-side roles.

## 5. Frontend Findings (Prioritized)

## High
1. Potential infinite/refetch loops in MyChats.
- Evidence:
  - client/src/components/ChatsComponent/MyChats.tsx useEffect depends on chats and updates chats inside effect.
- Risk: repeated API calls, CPU/network churn.
- Fix: remove chats from dependency list and trigger explicit refresh events.

2. Socket listener duplication/memory leaks in ChatBox.
- Evidence:
  - client/src/components/ChatsComponent/ChatContent/ChatBox.tsx has useEffect blocks without dependency arrays and missing cleanup around socket.on.
- Risk: duplicated events, stale closures, duplicate messages/notifications.
- Fix: initialize socket once, register listeners once with cleanup, use refs for active state.

3. Mixed deployed API base URL and hardcoded localhost asset URLs.
- Evidence:
  - axios baseURL points to deployed Render host.
  - multiple AvatarImage/message image URLs point to http://localhost:5000/uploads/... paths.
- Risk: broken media in deployed environment or CORS confusion locally.
- Fix: derive both API and asset base from environment variables consistently.

## Medium
4. Route guard logic tied to localStorage in effect dependency.
- Evidence:
  - client/src/App.tsx useEffect depends on localStorage object.
- Risk: unreliable auth state updates and lint warning.
- Fix: rely on Redux/auth state or storage event listener pattern.

5. Overuse of any and ts-ignore, multiple lint violations.
- Evidence:
  - lint output reports 29 errors, including no-explicit-any and ban-ts-comment.
- Risk: runtime bugs hidden by weak typing.
- Fix: introduce typed API responses and typed hooks/selectors.

6. GroupSettings has anti-pattern state call in render path.
- Evidence:
  - client/src/components/ChatsComponent/ChatContent/GroupSettings.tsx calls setLoading(false) during render.
- Risk: unnecessary render churn and logic confusion.
- Fix: remove render-path state writes; update loading state only in action handlers/effects.

## 6. How to Spin Up (Local)

Prerequisites:
- Node.js 18+ (recommended 20)
- npm 10+
- MongoDB Atlas (or local MongoDB URI)

Step 1: backend env file
- Create server/.env with at least:
  - PORT=5000
  - CONNECTION_URL=<your_mongodb_connection_string>
  - JWT_SECRET=<strong_random_secret>

Step 2: install dependencies

Backend:
- cd server
- npm install

Frontend:
- cd client
- npm install

If npm cache permission error appears:
- Temporary workaround used in this audit:
  - npm_config_cache=.npm-cache npm install
- Permanent fix suggested by npm:
  - sudo chown -R 501:20 /Users/ajiteshsrivastava/.npm

Step 3: run backend
- cd server
- npm run dev

Step 4: run frontend
- cd client
- npm run dev

Expected local URLs:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

Current config note:
- Frontend axios currently points to deployed Render API host; for true local dev, move base URL to env (for example VITE_API_BASE_URL) and set it to http://localhost:5000.

## 7. Recommended Improvement Plan

Phase 1 (must-do before real usage):
- Hash passwords with bcrypt and migrate auth flow.
- Replace hardcoded JWT secret with environment secret and rotate.
- Protect getMessages route and enforce chat membership.
- Fix MyChats effect dependency loop and ChatBox socket lifecycle.

Phase 2 (stability):
- Normalize API and asset base URLs via env config.
- Address all lint errors and remove ts-ignore/any where avoidable.
- Improve backend error handling consistency and response contracts.

Phase 3 (performance and operations):
- Add Mongo indexes:
  - User.email unique index
  - Message.chat + createdAt index
  - Chat.users + updatedAt index
- Add connection timeout options and graceful shutdown handling.
- Add automated tests (auth, chats, messages, socket events).
- Add root README with complete run/deploy instructions.

## 8. Overall Verdict

MongoDB + codebase is currently functional in parts but not safe/clean enough to be called "fine" yet.

- For local experimentation: possible after env setup and URL alignment.
- For production use: not recommended until the critical and high findings above are fixed.
