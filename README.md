# Product Admin Dashboard

React + Vite admin dashboard for DummyJSON products.

## Stack

- React
- JavaScript
- Tailwind CSS
- Axios
- Vite
- React Router

## Features

### Product Details (`/products/:id`)

- Displays product image gallery, title, description, category, price, rating, stock status, reviews, and specification overview.
- Handles invalid product IDs (e.g. `/products/999999`) with a dedicated **Product Not Found** screen and navigation back to the product list.
- Supports shared Axios API architecture with full error and loading states.

### Add Product (`/products/new`)

- Form for creating new products with Title, Category, Price, Stock, Image URL, and Description fields.
- Full client-side validation preventing:
  - Empty required fields (title, category, price, stock, description)
  - Invalid/negative price (`price > 0`)
  - Invalid/negative stock (`stock >= 0` integer)
- Real-time error feedback next to relevant input fields.
- Submission loading state and duplicate submission prevention (`isSubmitting` flag & disabled submit button).
- Navigates back to the product list upon successful creation with a success notification.

### DummyJSON Local Persistence Layer

> [!IMPORTANT]
> **DummyJSON Limitation**: DummyJSON is a mock API. Requests to `POST /products/add` simulate success and return a mock product object (e.g., `{ id: 195, ... }`), but **do not permanently persist changes on the DummyJSON backend**. Subsequent GET requests to `GET /products/195` directly from DummyJSON would return a 404 error.

To solve this limitation:
- A client-side persistence layer (`src/utils/localProductStorage.js`) uses `localStorage` to save added products.
- Added products seamlessly appear across the entire application (Product List, Product Details, Search, Category Filter, Sorting, and Pagination).
- Data survives browser refreshes.
- Designed as a modular storage module to easily extend for upcoming Edit and Delete operations.

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
npm run lint
npm run build
```
