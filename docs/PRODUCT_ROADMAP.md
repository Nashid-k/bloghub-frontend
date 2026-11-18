# BlogHub 2.0 — Product & Engineering Roadmap

**Product direction:** a reader-first publishing platform with a serious creator workflow and trustworthy community controls.

**Current implementation branch:** React 19 + Vite 7 frontend; Express 5 + MongoDB/Mongoose API; JWT authentication; editorial publishing workflow; private drafts; server-side search/pagination; persistent likes, bookmarks and comments. The `feature/bloghub-publishing-studio` branch contains the combined publishing and reader-engagement release awaiting review; main remains the last merged release until the PR is merged.

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

### Phase 0 — Foundation and visual system (completed in prior release)
**Goal:** replace the generic CRUD presentation without breaking the existing API.
- Establish typography, color, spacing, surfaces, responsive breakpoints and focus states
- Redesign global navigation, home feed, story cards, article page and auth/editor shells
- Add editorial discovery with server-side search and pagination
- Improve loading, empty, error and destructive-action states
- Add product metadata, favicon and page titles
- Preserve current endpoint contract and author-only edit/delete behavior

**Acceptance:** current routes remain reachable; existing API responses render; keyboard focus is visible; mobile layout works; no mock engagement controls are shown.

### Phase 1 — Publishing core
**Goal:** make creating and maintaining articles reliable.

**Delivered in the publishing-studio milestone:**
- Post fields for slug, excerpt, tags, status, publishedAt and readingTime
- Draft/publish workflow with authenticated author-only draft access and ownership checks
- Writing studio with preview, excerpt and topic entry, reading-time estimate, and explicit save/publish actions
- Server-side bounded pagination and escaped search across title, excerpt, body and tags
- Creator library with all/published/draft filters and real counts
- Article metadata and improved reading layout
- Validation coverage for status and editorial metadata

**Still outstanding in Phase 1:**
- Reliable autosave with conflict-safe updates and visible save state
- Rich-text or Markdown authoring with safe rendering/sanitization
- Cover image upload/storage, SEO metadata and canonical slug-based public URLs
- Database-backed integration tests for ownership, status transitions and pagination

**Acceptance:** authors can create, save, preview, publish, edit and unpublish; readers only see published content. The current milestone delivers the core workflow; remaining items stay explicitly in progress.

### Phase 2 — Discovery and reader engagement

**Delivered in the reader-engagement slice (on the open feature PR):**
- Persistent likes with set-based deduplication and server-calculated counts
- Personal bookmarks with a saved-reading-list endpoint and creator-dashboard display
- Persistent article comments with authenticated creation
- Comment removal limited to the comment author or story author
- Public story payloads expose reaction counts, not arrays of reader IDs
- Responsive article engagement controls and discussion UI

**Still outstanding:**
- Topic landing pages and tag browsing
- Comment pagination, reporting, moderation queue and rate limits
- Follow/unfollow authors and personalized feed
- Search indexing strategy for larger datasets
- Database-backed integration tests for engagement permissions and concurrency

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
