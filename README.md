# B2B Frontend (React + Vite)

React + Vite frontend for the B2B platform. Integrates with Laravel API (`/api/v1/*`), uses Sanctum auth, and sends stable device headers to pass backend `verify.device` middleware.

## Quick Start

- Prerequisites: Node.js `>=18`
- Install deps: `npm install`
- Create env file: `.env.local`

```
VITE_API_BASE_URL=http://localhost:8000/api
```

- Run dev: `npm run dev`
- Build: `npm run build`
- Preview build: `npm run preview`
- Lint: `npm run lint`

## Routes

- `/products` — Product listing
- `/product/:id` — Product detail
- `/orders` — Place New Order form
- `/vendor-products` — Vendor product list (vendor only)
- `/create-product` — Create product (vendor only)
- `/wishlist` — Wishlist
- `/cart` — Cart

## API Integration

- Base URL from `VITE_API_BASE_URL` (see `src/api/axiosConfig.js`)
- Auth: sends `Authorization: Bearer <token>` when logged in
- Device headers on every request:
  - `X-Device-Fingerprint`
  - `X-Device-Type`
  - `X-Browser`
  - `X-Platform`

## Device Fingerprint (403 fix)

- Implemented in `src/utils/deviceInfo.js`
- Fingerprint is cached in `localStorage` and excludes screen-based fields
- Prevents `401/403` when toggling mobile view in dev tools

## Orders Form (Address fields)

- Address inputs added: Pincode/Area Code, City, State, Village, Landmark
- On submit, these are composed into `shipping_address` string (see `src/pages/Orders.jsx`)

## Troubleshooting

- `401/403` on API: verify login and device headers; try clearing localStorage keys for auth and fingerprint, then login again
- Product detail blank fields: backend returns data under `res.data.data` — frontend reads that shape now

## Tech Stack

- React 19, Vite 7, TailwindCSS
- Axios for API
