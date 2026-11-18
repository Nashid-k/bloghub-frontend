# BlogHub — Modern Publishing & Reading Platform

<p align="center">
  <strong>A reader-first publishing experience with a focused workflow for writers.</strong>
</p>

<p align="center">
  <a href="https://github.com/Nashid-k/bloghub-frontend">Frontend</a>
  ·
  <a href="https://github.com/Nashid-k/bloghub-backend">Backend API</a>
</p>

BlogHub is a full-stack blogging platform for discovering stories, publishing articles, building an audience, and keeping up with reader activity. This repository contains the **React frontend**; the REST API lives in the companion backend repository.

---

## Contents

- [What you can do](#what-you-can-do)
- [Application structure](#application-structure)
- [Technology](#technology)
- [Getting started](#getting-started)
- [Configuration](#configuration)
- [Available scripts](#available-scripts)
- [Application routes](#application-routes)
- [Backend integration](#backend-integration)
- [How the frontend works](#how-the-frontend-works)
- [Development guidelines](#development-guidelines)
- [Troubleshooting](#troubleshooting)
- [Related project](#related-project)

## What you can do

### Read and discover
- Browse the published-story feed.
- Search stories using the backend-powered feed query.
- Open an article in its dedicated reading view.
- Explore author profiles and publication activity.
- Use responsive layouts across desktop and mobile screens.

### Write and publish
- Register and sign in to an account.
- Create stories and edit or delete your own content.
- Work with draft and published story states.
- Manage your writing from the creator-facing views.
- Add editorial metadata such as excerpts and topic tags.

### Engage with the community
- Like and bookmark stories.
- Read and contribute to article discussions.
- Follow authors and explore follower/following lists.
- Receive notifications for new followers, comments, likes, and bookmarks.
- View unread notification counts, browse older notifications, and mark notifications as read.

> Availability of private actions depends on authentication and server-side authorization. The API remains the source of truth for permissions and persisted state.

## Application structure

The frontend is maintained in the `client/` directory.

```text
bloghub-frontend/
└── client/
    ├── public/              # Static assets
    ├── src/
    │   ├── components/      # Navbar, notification UI and shared components
    │   ├── context/         # Authentication context
    │   ├── pages/           # Home, auth, profile and article screens
    │   ├── services/        # Axios API client and endpoint methods
    │   ├── App.jsx          # Application routes and providers
    │   ├── index.css        # Global styles and responsive design
    │   └── main.jsx         # Vite application entry
    ├── .env.example
    ├── package.json
    └── vite.config.js
```

The exact component and page inventory may evolve as features are refactored.

## Technology

| Area | Technology |
|---|---|
| UI | React 19 |
| Development/build | Vite 7 |
| Routing | React Router 7 |
| HTTP | Axios |
| Authentication state | React Context and hooks |
| Styling | Custom CSS |
| Code quality | ESLint 9 |

## Getting started

### Prerequisites

- Node.js compatible with Vite 7 (Node.js 20 or newer is recommended).
- npm.
- A running instance of the [BlogHub backend](https://github.com/Nashid-k/bloghub-backend).

### 1. Clone the repository

```bash
git clone https://github.com/Nashid-k/bloghub-frontend.git
cd bloghub-frontend/client
```

### 2. Install dependencies

```bash
npm ci
```

If the repository does not contain a committed lockfile, use `npm install` instead.

### 3. Configure the API URL

```bash
cp .env.example .env
```

Set `VITE_API_URL` to the backend origin. See [Configuration](#configuration).

### 4. Start the development server

```bash
npm run dev
```

Vite prints the local URL in the terminal (normally [http://localhost:5173](http://localhost:5173)).

### 5. Run the backend

Follow the backend repository's setup instructions and make sure its API is reachable from the browser. The default local API origin is `http://localhost:5000`.

## Configuration

Create `client/.env` from `.env.example`.

| Variable | Required | Description | Local example |
|---|---:|---|---|
| `VITE_API_URL` | Recommended | Backend origin, without the `/api` suffix | `http://localhost:5000` |

Example:

```env
VITE_API_URL=http://localhost:5000
```

The API client appends `/api` automatically. If `VITE_API_URL` is not set, requests use the relative `/api` path, which requires the hosting environment or dev-server proxy to route API requests.

**Security:** Vite exposes `VITE_*` values in browser bundles. Never put passwords, database credentials, JWT signing secrets, or private API keys in frontend environment variables.

Restart the Vite server after changing environment variables.

## Available scripts

Run these from `client/`:

| Command | Purpose |
|---|---|
| `npm run dev` | Start the local Vite development server |
| `npm run build` | Generate the production bundle in `dist/` |
| `npm run preview` | Serve the production bundle locally |
| `npm run lint` | Run ESLint |

Before opening a pull request, run:

```bash
npm run lint
npm run build
```

## Application routes

| Path | Screen | Access |
|---|---|---|
| `/` | Story feed and discovery | Public |
| `/blog/:id` | Article reading view | Public, with authenticated engagement where applicable |
| `/login` | Sign in | Public |
| `/register` | Create account | Public |
| `/create` | Create a story | Authenticated |
| `/edit/:id` | Edit a story | Authenticated; ownership enforced by API |
| `/profile` | Signed-in user's profile area | Authenticated |

Author profile and follower/following views are linked through the relevant UI flows.

## Backend integration

The frontend communicates with the companion Express API through a shared Axios client in `src/services/api.js`.

| API group | Purpose |
|---|---|
| `/api/auth` | Registration, login and logout |
| `/api/blogs` | Story feed, article details and author-owned story operations |
| `/api/blogs/:id/engagement` | Current reader's engagement state |
| `/api/blogs/:id/like` | Like/unlike a story |
| `/api/blogs/:id/bookmark` | Save/unsave a story |
| `/api/blogs/:id/comments` | Read and create comments |
| `/api/users/me` | Current user's profile |
| `/api/users/bookmarks` | Saved stories |
| `/api/users/:userId` | Public author profile |
| `/api/users/:userId/follow` | Follow/unfollow an author |
| `/api/users/notifications` | Notification inbox and read state |

See the [backend README](https://github.com/Nashid-k/bloghub-backend#readme) for request behavior, pagination, environment setup, and the complete API route reference.

## How the frontend works

### API requests
- API methods are grouped by domain in `src/services/api.js`.
- The shared Axios instance builds the API base URL.
- The request interceptor attaches the locally stored bearer token when one is present.
- Components call domain-specific methods instead of duplicating endpoint construction.

### Authentication
- Authentication state is shared through the React authentication context.
- The API validates tokens and enforces access to private resources.
- Client-side visibility is a user-experience aid, not a security boundary.

### Notifications
- The notification control retrieves the unread count and refreshes it periodically.
- The inbox uses cursor-based pagination to retrieve older entries.
- Readers can mark one notification or all notifications as read.
- Story-related notifications navigate to the associated article when available.

## Development guidelines

When contributing:

1. Keep API calls inside the service layer.
2. Keep authorization decisions on the backend; never trust client-supplied ownership.
3. Include loading, empty, error, and retry states for asynchronous screens.
4. Preserve responsive behavior and keyboard accessibility.
5. Avoid placeholder controls that imply an action is persisted when it is not.
6. Update this README when routes, environment variables, scripts, or user-facing capabilities change.
7. Run lint and production build before requesting review.

## Troubleshooting

**The app loads but API requests fail**
- Confirm the backend is running.
- Check `VITE_API_URL` and ensure it contains only the backend origin, not `/api`.
- Inspect the browser Network panel for the failing request and response.
- Confirm the backend's `CLIENT_URL` CORS allowlist includes the frontend origin.

**Requests return 401 or private screens do not load**
- Sign in again and check whether the local session token is present.
- Confirm the backend JWT configuration is valid.
- Remember that private endpoints require a valid authenticated session.

**Changes to environment variables have no effect**
- Restart the Vite development server.
- Confirm the file is named `.env` and is inside `client/`.

**The production build fails**
- Use a supported Node.js version.
- Install dependencies from the lockfile with `npm ci`.
- Run `npm run lint` and inspect the first reported error.

## Related project

- **Backend:** [Nashid-k/bloghub-backend](https://github.com/Nashid-k/bloghub-backend)
- **Frontend repository:** [Nashid-k/bloghub-frontend](https://github.com/Nashid-k/bloghub-frontend)

---

Built as an evolving full-stack publishing product. Features and implementation details should be verified against the current codebase; roadmap ideas are not presented as shipped functionality.
