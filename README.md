# BlogHub — Editorial Publishing Frontend

A React 19 + Vite frontend for BlogHub, a publishing platform in active evolution. The current application supports account registration/login, story discovery, reading, author-owned story CRUD and profile views. The editorial UI refresh is being developed on the `feature/bloghub-product-evolution` branch.

## Current experience

- Editorial landing page with story search across the currently loaded feed
- Responsive navigation and mobile menu
- Story cards with author/date metadata and author-only edit/delete actions
- Server-side paginated discovery and search
- Creator studio with draft/published filters, metadata editing and article preview
- Article excerpts, topic tags and reading-time metadata
- Article reading view
- Registration, login, create/edit story and creator profile routes
- Drafts are private to their author; the public feed only returns published stories
- Loading, empty and error states for the home feed

## Stack

- React 19
- Vite 7
- React Router 7
- Axios
- Context API and React hooks
- Custom responsive CSS design system

## Run locally

```bash
git clone https://github.com/Nashid-k/bloghub-frontend.git
cd bloghub-frontend/client
npm ci
cp .env.example .env
npm run dev
```

Open the Vite URL printed in the terminal (normally http://localhost:5173). Start the companion API from [bloghub-backend](https://github.com/Nashid-k/bloghub-backend) separately.

## Environment

`VITE_API_URL` is the backend origin without the `/api` suffix. It is public browser configuration; never place private credentials in `VITE_*` variables.

```env
VITE_API_URL=http://localhost:5000
```

## Scripts

- `npm run dev` — start Vite
- `npm run build` — create production build
- `npm run preview` — preview production assets
- `npm run lint` — run ESLint

## Product direction

See [BlogHub 2.0 Product Roadmap](docs/PRODUCT_ROADMAP.md) for the planned reader, creator, engagement, moderation and production-hardening milestones. Planned capabilities are not represented as shipped features.
