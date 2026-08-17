# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Nuxt 3 customer-facing storefront for the **Fooddly / Dibimall** platform (git remote: `mubashirkappan/thasweel`). It is a pure SPA-style frontend — all data comes from the Laravel API in the sibling repo at `/var/www/html/dibimall` (see that repo's `CLAUDE.md`, and its `postman/` collection for the full endpoint reference). There is no `server/` API code here; `server/` only holds a tsconfig.

## Commands

Package manager is **pnpm** (pinned to 9.15.4 in the Dockerfile).

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build        # Nitro output to .output/
pnpm preview
pnpm exec eslint .    # no `lint` script exists; config is @antfu/eslint-config
```

Docker dev (hot reload, bind-mounts the repo, forces `CHOKIDAR_USEPOLLING`):

```bash
docker compose up          # targets the `development` stage
docker build --target runner -t assakin-web .   # production image
```

There is **no test setup** in this repo — no test runner, no test files. The API contract these pages depend on is covered by the backend's `tests/Feature/Api/` suite instead.

## API base URL wiring (frequent source of breakage)

`nuxt.config.ts` declares `runtimeConfig.public.apiBaseUrl`, and every network call is written as
`` `${config.public.apiBaseUrl}/<path>` ``. Three env vars can feed it, through two different mechanisms:

- `BASE_URL` / `NUXT_PUBLIC_BASE_URL` — read explicitly in the `runtimeConfig` default expression.
- `NUXT_PUBLIC_API_BASE_URL` — picked up by Nuxt's automatic runtime-config override (this is what `docker-compose.yml` sets).

The value **must include the `/api` suffix** (`http://127.0.0.1:8000/api`), because the backend registers everything in `routes/api.php`. The checked-in `env` file currently has no `/api` suffix, and it is named `env`, not `.env`, so Nuxt does not auto-load it — treat it as a reference sheet, not config.

`runtimeConfig.public.frontendUrl` is separate and has exactly one consumer: `components/profile/qrcode.vue`, which builds `<frontendUrl>/<shop-slug>` into a printable QR code. If QR codes point at the wrong host, that is the variable to check.

## Architecture

### Two order flows coexist

1. **WhatsApp storefront flow.** `pages/[name].vue` is the per-shop storefront. Cart lives entirely client-side in `composables/cartData.ts` — nothing is sent to the server until checkout. `components/modal/leadGen.vue` POSTs the whole cart to `/order` (backend `TasOrder`), then builds a formatted text message and deep-links the buyer to the shop owner's WhatsApp (`intent://` on Android, `api.whatsapp.com` elsewhere — see also `utils/whatsappRedirect.js`). This is the flow recent commits actively develop.
2. **Server-side cart flow (older marketplace).** `pages/cart.vue`, `order.vue`, `customer-orders.vue`, `shopDetail.vue` use the authenticated `/add-to-cart`, `/get-cart`, `/confirm-order`, `/confirm-orders-list` endpoints backed by `Cart`/`Order` tables. Changes to the storefront cart do **not** touch this path.

### Routing

`pages/[name].vue` sits at the route root, so **any unmatched single-segment path is treated as a shop slug**. Adding a new top-level page means adding a file that shadows that slug space. Shop lookup is `GET /shops?shop=<slug>&from=thasweel`; a miss toasts and redirects to `/`.

`from=thasweel` is a tenant discriminator on the backend `shops` table — storefront and shop-management queries pass it; dropping it leaks other tenants' shops.

### State

Two Pinia stores, both persisted, but **not to the same place**:

- `composables/useAuth.ts` — `loggedIn`, `token`, `isOwner`, `ItemsCount`, plus the `loginPop`/`leadGen` modal flags. Declared as bare `persist: true`, i.e. the persistence module's default storage. `layouts/default.vue` does a full `window.location.reload()` whenever `token` changes.
- `composables/cartData.ts` — `useCartStore`, explicitly pinned to `persistedState.localStorage`, so it is **client-only** and unavailable during SSR. Cart items are keyed by item `name`, not id, and `initShopCart(shopId)` wipes the cart when `activeShopId` changes, so a buyer can only ever hold one shop's cart. Each line carries `unit`, `preparation_preference` (`'separate' | 'single_combined'`, only surfaced for weight-based units) and `item_note`.

That storage difference is what decides whether route middleware sees a logged-in user during SSR. If you change either store's `persist` option, re-check the guarded pages below.

### Route middleware

- `middleware/auth.ts` — requires `loggedIn`; toasts "Please Login" and redirects to `/`.
- `middleware/shopOwnerAdd.ts` — requires `loggedIn` **and** `isOwner === 1`, a strict comparison against a number the API returns as an int (`is_owner`). The store initialises `isOwner` to `''`, so a user who has never logged in fails on type as well as value.

Nuxt kebab-cases middleware filenames, so `shopOwnerAdd.ts` is referenced in `definePageMeta` as `'shop-owner-add'`.

### Calling the API

There is no shared HTTP client. Each call inlines `useRuntimeConfig()` and, when authenticated, `Authorization: Bearer ${token}` from the auth store. `$fetch` is used for JSON; `axios` is used specifically for the `FormData`/multipart uploads in the six `components/modal/*Addition.vue` / `*Edit.vue` components.

Backend responses are `{ success, data, message }`; errors surface as `error.data.message` and are shown via `useToast()`. Note the backend returns **HTTP 404 for business failures**, not just for missing routes, so never branch on status alone.

### Item price fields

`ItemResource` on the backend renames `dibi_price` → **`db_price`**. `db_price` is the price actually charged and displayed; `price` is the higher struck-through MRP. Stock is `available_count` (falls back to `count`), and `allow_note` gates the per-item note input.

## File map

### Pages

| File | Layout / guard | What it is | API calls |
|---|---|---|---|
| `index.vue` | default | Marketplace home: hero, shop listing, city search, how-it-works, partner/success sections | `GET /shops`, `GET /shops?city=` |
| `[name].vue` | `inner` | **The storefront.** Shop header, offer carousel, category filter, item grid, floating "proceed" bar that opens the checkout modal | `GET /shops?shop=&from=thasweel`, `POST /items`, `POST /offer/inside-shop-list` |
| `shopDetail.vue` | default | Marketplace-flow shop page (older sibling of `[name].vue`) | `GET /shops?shop=`, `POST /items` |
| `productDetail.vue` | default | **Static demo page** — renders mock rows from `data/items.js`, not wired to the API | none |
| `cart.vue` | `auth` | Server-side cart: line items, quantity, confirm, remove | `GET /get-cart`, `POST /confirm-order`, `POST /delete-from-cart` |
| `order.vue` | `auth` | Buyer's confirmed-order history | `GET /confirm-orders-list` |
| `customer-orders.vue` | `auth` | Orders placed against the signed-in owner's shops (server-cart lineage) | `GET /get-orders` |
| `profile.vue` | `auth` | Account details, referral block, shop QR code | `GET /get-user` |
| `shop-management/index.vue` | `shop-owner-add` | Owner's shop list — add, edit, delete a shop | `GET /get-user`, `GET /shop/list?from=thasweel`, `GET /shop/delete/{encrypted_id}` |
| `shop-management/[name].vue` | `shop-owner-add` | **The owner console** (largest file, ~550 lines): categories, items, offer banners and orders for one shop | `GET /shop/list`, `POST /categories/list`, `GET /categories/delete/{id}`, `POST /items/list`, `GET /items/delete/{id}`, `GET /items/status-change/{id}`, `POST /offer/inside-shop-list`, `GET /offer/delete/{id}`, `GET /order-list?shop_id=`, `POST /deliverd` |
| `order-management.vue` | `shop-owner-add` | Standalone order queue across the owner's shops, with mark-delivered | `GET /shop/list?from=thasweel`, `GET /order-list?shop_id=`, `POST /deliverd` |

### Modals (`components/modal/`)

Each owns one form and its submit call. `leadGen.vue` and `login.vue` are opened via flags on the auth store rather than local props, so they can be triggered from anywhere.

| File | Purpose | API calls |
|---|---|---|
| `leadGen.vue` | **Checkout.** Item summary, courier-charge notice, buyer name/phone/address/delivery-time form; on success builds the WhatsApp message and redirects | `POST /order` |
| `login.vue` | Login form (zod-validated); stores token + `is_owner` | `POST /customer-login` |
| `shopAddition.vue` | Create a shop, with live slug-availability check | `POST /check-shop-user-name`, `POST /create-shop` (axios), `GET /places-list` |
| `shopEdit.vue` | Edit a shop | `POST /shop/update` (axios), `GET /places-list`, `POST /check-shop-user-name` |
| `itemAddition.vue` / `itemEdit.vue` | Item create/edit incl. unit, stock, note toggle | `POST /items/create` / `POST /items/update` (axios) |
| `categoryAddition.vue` | Create a category | `POST /categories/create` (axios) |
| `bannerAddition.vue` | Upload an offer banner | `POST /offer/create` (axios) |
| `refer.vue` | Referral code display/share | `GET /refer` |
| `confirm.vue` | Generic yes/no confirmation (used for logout and deletes) | none |

### Other components

- `core/` — `Nav` (fetches `/shops` for the shop switcher, currently commented out in the template), `Footer`/`FooterSec`, `ItemCard` (the whole add-to-cart interaction: quantity, stock guard, fulfilment preference, note field), `Counter`, `ItemsSearch`, `PlaceSearch` (`GET /places-list`), `Listing`, `ListingCart`, `ShopCard`, `ProductCard`, `Rating`.
- `shop/` — `Hero`, `Swiper` (offer carousel), `Category` (filter chips), `ContactUs` (`POST /contact-us`).
- `shopDetails/info.vue` — storefront header: name, address, phone, delivery/take-away badges.
- `home/` — `Hero`, `HowItsWork`, `PartnerWithUs`, `SuccessStories` (`GET /shop/list`).
- `profile/qrcode.vue` — generates a QR pointing at `<frontendUrl>/<slug>`.

### Non-source / dead weight

- `data/*.js` (`cart`, `items`, `order`, `shops`) — mock fixtures. Only `productDetail.vue` still imports them.
- `ui.config/` — a vendored copy of Nuxt UI's default theme files, **not imported anywhere**; editing it has no effect. Real theming is `app.config.ts` (`primary: 'red'`) plus the `red`/`secondary` scales in `tailwind.config.ts`. Colour mode is pinned to light.
- `*.onetoc2` and `New Section 1.one` — stray OneNote artifacts scattered through the tree.
- `Dockerfile`, `docker-compose.yml`, `env` are frequently modified in-place for local dev; check `git status` before assuming they reflect deployed config.

### Auto-import naming

Components auto-import by directory prefix: `components/core/Nav.vue` → `<CoreNav>`, `components/modal/leadGen.vue` → `<ModalLeadGen>`, `components/shopDetails/info.vue` → `<ShopDetailsInfo>`.
