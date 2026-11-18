# BlogHub — React Blogging Frontend

A React single-page application for BlogHub, with JWT-based authentication, blog management and user-profile screens. The app uses Vite for development and production builds.

## Features

- Register, login and logout flows
- Browse and view blog posts
- Create, edit and delete blog posts
- Profile view and user-owned post management
- Axios API client with bearer-token attachment
- Responsive page and reusable component structure

## Stack

- React 19
- Vite 7
- React Router 7
- Axios
- Context API and React hooks

## Run locally

```bash
git clone https://github.com/Nashid-k/bloghub-frontend.git
cd bloghub-frontend/client
npm install
cp .env.example .env
npm run dev
```

Open the Vite URL printed in the terminal (normally [http://localhost:5173](http://localhost:5173)).

## Environment

`VITE_API_URL` is the backend origin without the `/api` suffix.

```env
VITE_API_URL=http://localhost:5000
```

Vite exposes `VITE_*` values to browser code. Never place private credentials in these variables.

## Scripts

- `npm run dev` — start Vite
- `npm run build` — create production build
- `npm run preview` — preview the production build
- `npm run lint` — run ESLint

## Related repository

[BlogHub backend](https://github.com/Nashid-k/bloghub-backend)
