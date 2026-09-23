# Product Admin Dashboard

React + Vite admin dashboard for DummyJSON products. Authentication from stage 1 is unchanged.

## Stack

- React
- JavaScript
- Tailwind CSS
- Axios
- Vite
- React Router

## Product list (`/products`)

The URL is the source of truth for list state:

`/products?page=2&limit=20&search=phone&category=smartphones&sort=price-asc`

Refreshing or sharing the URL restores the same view. Invalid `page`, `limit`, and `sort` values are normalized (`page=1`, `limit=10`, default sort). Pages beyond the last page are clamped to the last valid page.

Allowed page sizes: `10`, `20`, `50`.

### Search + category

DummyJSON cannot apply search and category together on one server endpoint.

- Search only → `GET /products/search?q=`
- Category only → `GET /products/category/:category`
- Search and category → search on the server, then filter those results by category in the client
- Sort uses DummyJSON `sortBy` / `order` for single-constraint requests, and client-side sorting when search and category are combined

### Search race conditions

Each product request is tied to an `AbortController`. When search, filters, sort, or pagination change, the previous request is aborted so a slower response (including DummyJSON `?delay=2000`) cannot replace newer results.

The search input is debounced by 450ms and does not call the API on every keystroke.

## Scripts

```bash
npm install
npm run dev
```
