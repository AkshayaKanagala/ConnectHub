# Login milestone and local verification

The inspected repository already had a login API call, protected routes, and feed CRUD requests. This change completes session handling without changing backend contracts or removing existing features.

## Files changed

- `client/src/api.js`: 15-second timeout, current Bearer token on requests, invalid-session event on protected 401 responses. Login 401 responses stay on the form.
- `client/src/context/AuthContext.jsx`: shared session/user state, login response validation, server-backed saved-token validation through GET `/api/auth/me`, retry, logout and cross-tab synchronization.
- `client/src/main.jsx`: mount AuthProvider.
- `client/src/components/ProtectedRoute.jsx`: wait for validation, block unauthenticated requests, preserve destination, show session verification errors and retry.
- `client/src/pages/Login.jsx`: normalized email, accessible error messages, required fields, autocomplete, loading/duplicate-submit handling, replace navigation to the requested route or feed.
- `client/src/components/Navbar.jsx`: logout through shared state and show authenticated member name.
- `client/.env.example`: local API URL. `.gitignore` permits tracked example environment files.

The backend remains authoritative: JWT validation is performed by `server/middleware/authMiddleware.js`. Tokens retain the existing localStorage persistence, which requires preventing XSS; no credentials or tokens are logged by the new login code.

## Run locally (Windows PowerShell)

1. Use the branch containing this change. In `server`, run `npm.cmd ci`. Keep your existing untracked `.env` containing `MONGO_URI`, `JWT_SECRET`, and optional `PORT=5000`. Run `npm.cmd run dev`. Wait for the database connection and server listening message.
2. In a second terminal, enter `client`, run `npm.cmd ci`, copy `.env.example` to `.env` (`Copy-Item .env.example .env`), and run `npm.cmd run dev`. The API URL is the server origin, without `/api`. Restart Vite after changing environment variables.
3. Open http://localhost:5173/feed while logged out: expect the login screen.
4. Enter an incorrect password: expect the backend's invalid-credentials message and no new token. Stop the server and retry: expect a connection error and an enabled button afterward.
5. Restart the server and sign in with an existing registered user's credentials. Expect `/feed` and `Signed in as <name>`. Network requests should include `Authorization: Bearer <token>`.
6. Refresh: `/api/auth/me` validates the session before protected content appears. Log out: token is removed; revisiting protected routes returns to login.
7. Set an invalid token in localStorage and refresh: backend 401 clears it and returns to login. Stop the server with a saved token and refresh: session error offers Retry without discarding the saved token. Restart and Retry.

No production deployment or database credentials are needed to review the code. A live integration check needs your actual MongoDB environment and an existing registered account.

## Automated browser checks

Start Vite. Install Playwright outside the app dependency tree if needed, with its Chromium browser, and run `node tests/login.browser.cjs` from the repository root. The script resolves Playwright from the project or `CODEX_PRIMARY_RUNTIME_NODE_MODULES`. `CLIENT_URL` overrides the Vite origin. These tests use mocked API responses; they do not prove MongoDB connectivity or a real JWT login.

Build: `cd client` then `npm.cmd run build`. Lint: `npm.cmd run lint`.

## Exact next feed milestone: reliable read-only loading

Feed integration already exists, so the next smallest step is to make its initial read reliable and observable rather than recreate it.

1. Create `client/src/services/posts.js`: export `getPosts({ signal })` calling `API.get('/api/posts', { signal })`; validate `data.success` and `Array.isArray(data.posts)` and return the array. Use shared API authentication rather than copying token/header code.
2. Edit `client/src/pages/Feed.jsx`: use `useAuth().user` instead of `currentUser`, `fetchCurrentUser`, and the duplicate `/api/auth/me` request. Change initial post loading to use the service with an AbortController and cleanup. Add loading/error states, Retry, and a distinct successful-empty state. Use functional updates/cleanup so aborted or stale requests cannot overwrite newer results.
3. In that same file, stop automatically fetching comments for every post during initial feed load. Fetch comments on expansion; keep comment errors separate from the post-list state. Preserve existing mutation handlers while moving their refresh calls to the shared post loader.
4. Create `client/src/components/PostCard.jsx`: extract existing post display with `_id`, `content`, populated `author`, `createdAt`, `likes`, and optional populated `sharedPost`. Render a fallback for deleted/missing authors and shared originals. Preserve ownership controls and callbacks from Feed.
5. Edit `client/src/styles.css`: add consistent feed loading, empty, and error/retry styling.
6. Create `tests/feed.browser.cjs`: verify populated response, empty response, server failure/retry, token header, cancellation on navigation, missing author, and expired-session redirect. Then check against the real local API with known posts.

Backend contract to retain: `server/routes/postRoutes.js` protects GET `/api/posts`; `server/controllers/postController.js#getPosts` returns `{ success: true, posts }`, populated author/shared author, newest first. No backend change is required for this milestone. This endpoint currently returns all posts; it is not a following-only feed and has no pagination. Those are later milestones.

## Validation recorded for this change

- `npm run build`: passed.
- `npm run lint`: completed with four existing warnings in Feed/Profile/UserProfile; no new warnings from the login/session files.
- `node --test tests/api.test.mjs`: passed; checks current-token headers, login header exclusion, timeout configuration, login 401 preservation, transient failure preservation, and protected 401 invalidation.
- `git diff --check`: passed.
- Full browser test: prepared but not executed successfully; Chromium installation failed because the downloaded archive was invalid/truncated. Run it locally as described above.
- Live MongoDB login: not run; server environment/registered account were not available in this workspace.
