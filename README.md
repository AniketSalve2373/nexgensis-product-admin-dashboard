# Nexgensis Product Admin Dashboard

A production-ready React + Vite Product Admin Dashboard built for the **Nexgensis Technologies Pvt. Ltd. React Developer Assignment**.

> **Framework Choice Note**:
> Although the assignment mentioned Next.js, this implementation uses **React with Vite** because React was the developer's current working technology.

---

## Tech Stack

- **Framework & Build Tool**: React 19, Vite
- **Styling**: Tailwind CSS v4
- **HTTP Client**: Shared Axios instance with Interceptors
- **Routing**: React Router v7
- **Language**: JavaScript (ES6+)
- **API Backend**: DummyJSON API (`https://dummyjson.com`)

---

## Live Demo & Repository Placeholders

- **GitHub Repository**: [https://github.com/AniketSalve2373/nexgensis-product-admin-dashboard](https://github.com/AniketSalve2373/nexgensis-product-admin-dashboard)
- **Live Deployment**: [https://nexgensis-product-admin-dashboard.vercel.app](https://nexgensis-product-admin-dashboard.vercel.app)

---

## Admin Credentials

| Role | Username | Password | API Endpoint |
|---|---|---|---|
| Admin | `emilys` | `emilyspass` | `POST https://dummyjson.com/auth/login` |

---

## Installation & Running Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/AniketSalve2373/nexgensis-product-admin-dashboard.git
   cd nexgensis-product-admin-dashboard
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Development server**:
   ```bash
   npm run dev
   ```

4. **Linting**:
   ```bash
   npm run lint
   ```

5. **Production build**:
   ```bash
   npm run build
   ```

---

## Features Completed

- [x] **Authentication**: Login form with error handling, duplicate submit protection, token storage in localStorage, automatic authorization header via Axios request interceptors, protected routes, logout, and session restoration.
- [x] **Shared Axios Architecture**: Single centralized Axios instance with base URL `https://dummyjson.com`, automatic bearer token injection, and global error handling.
- [x] **Product Listing**: Responsive desktop data table and mobile card layout with image, title, category, price, rating, stock status, and action buttons.
- [x] **Pagination**: Page size selector (10, 20, 50), Previous/Next controls, visible page numbers, total item counter ("Showing 21–40 of 194"), and URL page/limit synchronization.
- [x] **Search**: Search by product title, debounced input (450ms) to prevent unnecessary requests, page reset to 1 on query change, and AbortController stale request protection.
- [x] **Category Filter**: Category dropdown populated dynamically from `/products/categories`, synced to URL.
- [x] **Sorting**: Sort by Price, Rating, and Title (ascending & descending), fully URL-controlled.
- [x] **URL State Synchronization**: State persisted in URL search parameters (`/products?search=phone&category=smartphones&sort=price-asc&page=1&limit=20`). Safe normalization for invalid queries (`?page=abc`, `?page=-5`, `?limit=17`, `?sort=invalid`).
- [x] **Product Details (`/products/:id`)**: Responsive view with image gallery, specs, rating, stock status, and customer reviews.
- [x] **Product Not Found (`/products/999999`)**: Dedicated empty state screen for non-existent or deleted products with navigation back to products.
- [x] **Add Product (`/products/new`)**: Full form with validation (required title, description, positive price, non-negative integer stock, category select, optional valid image URL), duplicate request prevention, loading state, and success feedback.
- [x] **Edit Product (`/products/:id/edit`)**: Pre-filled form with validation, loading states, error handling, duplicate save protection, and local persistence.
- [x] **Delete Product**: Action trigger with confirmation modal dialog, duplicate delete protection, loading state, success banner feedback, and instant list update.
- [x] **Client-Side CRUD Persistence**: LocalStorage persistence layer for added, edited, and deleted products ensuring changes survive browser refreshes.
- [x] **Loading & Empty & Error States**: Clean loading skeletons/spinners, empty results message ("No products found"), and error screens with Retry buttons.
- [x] **Responsive Layout & Navigation**: Desktop collapsible sidebar with chevron toggle button, mobile drawer overlay, header with visible initials/avatar fallback, user details, and logout button.
- [x] **Accessibility & Security**: Visible focus outlines, semantic markup (`aria-label`, `aria-modal`), input labels, and request cancellation.

---

## Technical Implementations & Explanations

### 1. Authentication Strategy
Authentication relies on the `POST https://dummyjson.com/auth/login` endpoint. Upon successful login, the `accessToken` and user object are stored in `localStorage`. A React `AuthContext` provides authentication state throughout the app. A single shared Axios instance automatically attaches `Authorization: Bearer <token>` to all outgoing requests. If any API call returns a `401 Unauthorized` (excluding login credentials failure), the interceptor automatically clears auth storage and redirects to `/login`.

### 2. Search & Stale Request Protection (AbortController)
To handle search smoothly:
- Input keystrokes are debounced by 450ms using a `setTimeout` cleanup hook before triggering search state updates.
- Every product request creates an `AbortController` instance. If a user types new search criteria or changes filters while a previous request is still in flight (e.g. when testing slow connections using `?delay=2000`), the previous request is aborted via `controller.abort()`.
- Out-of-order responses from stale requests are ignored, preventing old search results from overwriting newer search results.

### 3. Search + Category Limitation Handling
DummyJSON does not support simultaneous search (`/products/search?q=`) and category filtering (`/products/category/:category`) on a single server endpoint.
To handle this cleanly:
- When both `search` and `category` parameters exist in the URL, the app fetches all matching search results from DummyJSON and applies category filtering on the client side.
- When sorting is applied alongside combined search/category filters, sorting is evaluated across the combined dataset.
- This provides consistent, predictable UX without making fake combined API calls.

### 4. Client-Side Local Storage CRUD Persistence
DummyJSON CRUD endpoints (`POST /products/add`, `PUT /products/:id`, `DELETE /products/:id`) simulate success responses but **do not permanently persist changes on the DummyJSON backend**.

To satisfy production requirements:
- A custom persistence utility (`src/utils/localProductStorage.js`) manages three localStorage keys:
  - `nexgensis_added_products`: Array of newly added product objects.
  - `nexgensis_edited_products`: Object map storing updated product fields keyed by product ID.
  - `nexgensis_deleted_products`: Array of deleted product IDs.
- When loading product lists or detail views, the application overlays local edits, filters out deleted products, and prepends newly added products.
- Browser refreshes preserve all CRUD changes across search, filtering, sorting, pagination, and detail pages.

### 5. URL State Normalization & Error Resilience
URL search parameters serve as the single source of truth for product listing state (`page`, `limit`, `search`, `category`, `sort`).
- `parseLimit`: Clamps invalid values (`limit=abc`, `limit=17`) back to default `10`.
- `parsePage`: Clamps invalid values (`page=abc`, `page=-5`) back to `1`.
- `parseSort`: Resets invalid sort values (`sort=invalid`) back to default.
- If `page` exceeds the total number of available pages (e.g., `?page=999999`), `useProductList` automatically redirects to the last valid page.

---

## Problems Faced & Solutions

1. **DummyJSON Backend Ephemeral Storage**:
   - *Problem*: Items created or edited via API calls disappeared when viewing product details or refreshing the page because DummyJSON does not save updates on their servers.
   - *Solution*: Developed a local persistence layer in `localProductStorage.js` that intercepts and merges local CRUD operations with API responses.

2. **Broken Avatar Images in DummyJSON**:
   - *Problem*: External user avatar URLs returned by DummyJSON (`https://dummyjson.com/icon/emilys/128`) frequently fail or break.
   - *Solution*: Designed a fallback avatar component that detects image load errors (`onError`) and renders a clean Tailwind CSS initials badge (`EJ`) guaranteed to remain visible.

---

## AI Usage Note

This project was developed with pair-programming assistance from **Antigravity AI (Google DeepMind)** for rapid architecture inspection, UI design refinement, stale-request protection validation, full CRUD persistence implementation, ESLint compliance, and production verification.
