# BlogHub 2.0 — Product & Engineering Roadmap

**Product direction:** a reader-first publishing platform with a serious creator workflow and trustworthy community controls.

**Current baseline:** React 19 + Vite 7 frontend; Express 5 + MongoDB/Mongoose API; JWT authentication; user-owned blog CRUD. The current data model has users (name/email/password) and posts (title/content/author), with auth, blogs and current-user profile routes.

**Target:** evolve the foundation through small, testable releases. This roadmap describes intended work, not functionality that already exists.

## Product principles

1. Reading comes first: fast discovery, readable typography and thoughtful article pages.
2. Writing feels like a product: drafts, autosave, previews, publishing states and validation.
3. Creators own their work: profiles, publication history and audience signals.
4. Trust is built in: server-enforced roles, moderation, rate limits and audit trails.
5. Ship complete vertical slices: UI, API, data model, tests, docs and deployment notes.
6. No fake functionality: do not show engagement controls until the API persists and authorizes them.

## Experience map

### Public / reader
- Editorial home with featured story, latest stories and search
- Search results with pagination and proper loading, empty and error states
- Article page with author profile, reading time, publication date and share actions
- Topic/tag pages and author pages
- Responsive navigation and accessible reading controls

### Signed-in reader
- Reader profile and bookmarks / reading lists
- Likes and comments
- Follow authors and personalized feed
- Notification inbox and preferences

### Author studio
- Overview dashboard: published posts, drafts, views and engagement
- Writing editor with autosave, preview, cover image, excerpt, tags and SEO metadata
- Draft / scheduled / published / archived lifecycle
- Post management, revision history and basic analytics
- Public creator profile and settings

### Administration
- Role-based admin area
- Reports queue and moderation actions
- User and publication management
- Audit log for privileged actions
- Platform health and operational metrics

## Delivery plan

### Phase 0 — Foundation and visual system (current milestone)
**Goal:** replace the generic CRUD presentation without breaking the existing API.
- Establish typography, color, spacing, surfaces, responsive breakpoints and focus states
- Redesign global navigation, home feed, story cards, article page and auth/editor shells
- Add client-side search over stories returned by the existing API
- Improve loading, empty, error and destructive-action states
- Add product metadata, favicon and page titles
- Preserve current endpoint contract and author-only edit/delete behavior

**Acceptance:** current routes remain reachable; existing API responses render; keyboard focus is visible; mobile layout works; no mock engagement controls are shown.

### Phase 1 — Publishing core
**Goal:** make creating and maintaining articles reliable.
- Add post fields: title, slug, excerpt, body, cover image metadata, tags, status, publishedAt, readingTime and SEO fields
- Draft and publish workflow with server-side ownership checks
- Autosave with explicit save state and conflict-safe updates
- Markdown or structured rich-text content with safe rendering/sanitization
- Server-side pagination, sorting and search
- Slug-based public article URLs with stable ID fallback
- Tests for validation, ownership, status transitions and pagination

**Acceptance:** authors can create, save, preview, publish, edit and unpublish; readers only see published content.

### Phase 2 — Discovery and reader engagement
- Topics/tags and topic landing pages
- Bookmarks and reading lists
- Likes/reactions with uniqueness constraints
- Comments with moderation and pagination
- Follow/unfollow authors
- Search indexing strategy and query limits
- Personalized feed based on followed authors and topics

**Acceptance:** engagement is persisted, authenticated where required, deduplicated and covered by API tests.

### Phase 3 — Creator profiles and analytics
- Public author profile, bio, avatar and social links
- Author dashboard with views, reads, bookmarks and engagement trends
- Per-article analytics and date filters
- Draft management, scheduled publishing and revision history
- Notification preferences and in-app notifications

**Acceptance:** metrics have documented definitions and derive from real events, not fabricated counters.

### Phase 4 — Admin, trust and safety
- Explicit roles: reader, author, moderator, admin
- Central authorization policy and server-side role checks
- Content reports, review queue, takedown/restore workflow
- Account suspension and audit records
- Rate limiting, abuse controls and admin action logs
- Privacy, retention and account deletion flows

**Acceptance:** every privileged action is server-authorized, auditable and tested against unauthorized access.

### Phase 5 — Production hardening and scale
- Secure auth lifecycle: short-lived access tokens, refresh strategy, revocation and rotation
- Security headers, request validation, payload limits, CORS allowlist and rate limits
- Structured logs, request IDs, health/readiness endpoints and error monitoring
- Database indexes, query plans, pagination limits and backup/restore runbook
- Image storage/CDN, image transformations and upload validation
- CI for lint, tests and build; preview deployments and release checks
- Accessibility review, performance budgets and browser testing

**Acceptance:** documented SLOs and operational runbooks; CI blocks regressions; production secrets are managed outside Git.

## Proposed domain model

| Entity | Core fields (target) | Notes |
|---|---|---|
| User | name, email, passwordHash, role, bio, avatar, status | Role and status are server-controlled |
| Post | authorId, title, slug, excerpt, body, cover, tags, status, publishedAt, readingTime, SEO | Drafts private to author and authorized staff |
| Comment | postId, authorId, body, status, parentId | Moderated and paginated |
| Reaction | postId, userId, type | Unique compound index per user/post/type |
| Bookmark | postId, userId, createdAt | Unique compound index per user/post |
| Follow | followerId, followingId | Unique pair; prevent self-follow |
| Report | reporterId, targetType, targetId, reason, status | Moderation workflow |
| Notification | recipientId, actorId, type, targetId, readAt | Index by recipient and createdAt |
| PostRevision | postId, editorId, snapshot, createdAt | Append-only history |
| AuditEvent | actorId, action, target, metadata, createdAt | Privileged actions only |

Introduce entities incrementally. Do not add all collections before their product flows exist.

## API direction

Keep current /api/auth, /api/blogs and /api/users routes stable during Phase 0. Evolve toward versioned groups: /api/v1/auth, /posts, /users, /topics, /comments, /reactions, /bookmarks, /follows, /notifications and /admin.

Use a consistent response envelope, cursor or bounded page pagination, validation schemas and centralized error mapping. Migrate only with compatibility tests.

## Architecture decisions

- Frontend: keep React + Vite; introduce feature-oriented modules for feed, editor, auth, profile, engagement and admin as each feature lands.
- Server state: adopt TanStack Query when Phase 1 begins; avoid duplicating API cache in ad-hoc global state.
- Backend: retain Express + Mongoose initially; separate routes, controllers, services, validators and policies as complexity grows.
- Content: choose Markdown or a structured editor format before rich text; sanitize rendered HTML.
- Uploads: use object storage with signed uploads; do not store large image binaries in MongoDB.
- Search: begin with MongoDB indexes; evaluate a dedicated search service only when measured needs justify it.
- Authorization: deny by default; enforce on API, never only in React route guards.

## Quality gates

Every phase adds unit tests for domain rules, API integration tests for success/invalid/unauthorized cases, frontend interaction tests, ESLint + production build in CI, mobile and keyboard checks, and updated API docs/environment/migration notes.

## Initial priority backlog

| Priority | Work item | Why |
|---|---|---|
| P0 | Editorial visual system and responsive home feed | First impression and usability |
| P0 | Fix backend validation and model defects | Prevent malformed records and runtime defects |
| P0 | Secure JWT configuration and auth error handling | Baseline account safety |
| P0 | Add API tests and reliable CI | Make subsequent changes safe |
| P1 | Post status, slug, excerpt and tags | Real publishing workflow |
| P1 | Search + pagination | Scale beyond a small demo feed |
| P1 | Editor autosave and preview | Creator experience |
| P2 | Bookmarks, reactions and comments | Reader engagement |
| P2 | Author profiles and analytics | Creator retention |
| P3 | RBAC, reports and audit trail | Multi-author governance |

## Definition of done

A feature is done only when its UI, API, persistence, authorization, validation, tests, loading/error/empty states, accessibility behavior and documentation are complete. A static mock or frontend-only control does not count as shipped functionality.
