# Elementor rebuild guide

Rebuild each page below in Elementor. The plugin supplies dynamic pieces via **shortcodes** — in Elementor, drag a **Shortcode** widget onto the canvas and paste the tag. Reference the original React routes in `src/routes/` for copy and section order.

Brand: dark teal background `#05201f`, panels `#0b2e2c`, accent `#17c3b2`, text `#e6f4f2`. Set these in **Elementor → Site Settings → Global Colors** so every widget inherits them.

---

## 0. Global setup

1. **Site Settings → Global Colors**: add Primary `#17c3b2`, Background `#05201f`, Text `#e6f4f2`.
2. **Theme Builder** (Elementor Pro) or your theme: build the **Header** and **Footer**.
   - Header nav (from `src/components/site/header.tsx`): Home, About, Science, Therapeutic Areas, Quality, Resources, Contact + **Login** link + **Request Access** button. Enable "shrink on scroll" (sticky header effect) and the mobile hamburger.
   - Footer (from `src/components/site/footer.tsx`): links to policy pages + copyright.
3. Upload the logo `src/assets/synthera-logo.png` to the Media Library and set it in the header.

## 1. Public pages (build in Elementor)

| Page | Original route | Key sections / notes |
|---|---|---|
| **Home** | `routes/index.tsx` | Hero "Advancing Therapeutics Through Science & Innovation" → value cards → about split → therapeutic focus cards → science pipeline → 5-step approach → why Synthera → quality → insights → partnership CTA. For the hero background see **§4 DNA hero**. |
| **About** | `routes/about.tsx` | Company story, mission, split image/text. |
| **Science** | `routes/science.tsx` | Pipeline / approach sections. |
| **Therapeutic Areas** | `routes/therapeutic-areas.tsx` | Cards per area (matches taxonomy `syn_area`). |
| **Quality** | `routes/quality.tsx` | Quality/standards content. |
| **Resources** | `routes/resources.index.tsx` | Add a **Shortcode** widget: `[synthera_resources count="12"]`. Detail pages render from the `syn_resource` CPT automatically. |
| **Contact** | `routes/contact.tsx` | Add **Shortcode**: `[synthera_contact]`. |
| **Request Access** | `routes/request-access.tsx` | Add **Shortcode**: `[synthera_request_access]` (has built-in thank-you state). |
| **Login** | `routes/login.tsx` | Add **Shortcode**: `[synthera_login]` (title "Welcome to Synthera"). |
| **Policies** | `terms`, `privacy`, `disclaimer`, `refund-policy`, `shipping-policy`, `faq` | Plain content pages. |
| **Forgot / Reset password** | `forgot-password.tsx`, `reset-password.tsx` | Use WordPress's built-in flow (`wp_lostpassword_url()`), already linked from `[synthera_login]`. No custom page needed unless you want to style `wp-login.php?action=lostpassword`. |

## 2. Portal page (gated — build once)

1. Create a page titled **Portal** (or "My Account").
2. Add a single **Shortcode** widget: `[synthera_portal]`.
3. In **Synthera Portal → Settings**, set this as the **Portal page**.

The shortcode renders the whole customer app and switches sub-views via `?view=` — matching the original `_authenticated/customer.*` routes:

| Original route | Portal view URL |
|---|---|
| `customer.dashboard.tsx` | `?view=dashboard` |
| `customer.products.index.tsx` | `?view=products` |
| `customer.products.$slug.tsx` | `?view=product&id=<ID>` |
| `customer.requests.tsx` | `?view=requests` |
| `customer.documents.tsx` | `?view=documents` |
| `customer.profile.tsx` | `?view=profile` |
| `customer.support.tsx` | `?view=support` |

Logged-out visitors hitting the portal page are redirected to the login page automatically.

## 3. Admin portal

The original `_authenticated/admin.*` routes become **wp-admin** screens under the **Synthera Portal** menu (Dashboard, Access Requests, Product Requests, Inquiries, Settings), plus the native **Products** and **Resources** list screens. No Elementor work needed — admins use wp-admin.

| Original admin route | wp-admin location |
|---|---|
| `admin.dashboard.tsx` | Synthera Portal → Dashboard |
| `admin.products.tsx` | Products (CPT list) |
| `admin.access-requests.tsx` | Synthera Portal → Access Requests |
| `admin.requests.tsx` | Synthera Portal → Product Requests |
| `admin.inquiries.tsx` | Synthera Portal → Inquiries |
| `admin.customers.tsx` | Users (filter by role "Synthera Customer") |
| `admin.resources.tsx` | Resources (CPT list) |

## 4. The 3D DNA hero

Elementor has no native Three.js widget. Pick one:

- **Easiest — static image:** use `src/assets/synthera-cinematic-dna-hero.jpg` as a Section background with a dark overlay.
- **Recommended — video loop:** record a few seconds of the original hero (`src/components/site/dna-helix-3d.tsx`) and use it as a **Video background** on the hero Section. Best balance of motion and performance.
- **Advanced — keep the real 3D:** build the hero React component into a standalone JS/CSS bundle and load it with an **HTML** widget into a `<div id="synthera-hero">`. Highest effort; watch mobile performance.

## 5. Redirects

The old app redirected removed product URLs to login. Add equivalent redirects (e.g. with a redirects plugin or your theme): `/products`, `/categories`, `/cart`, `/checkout` → the Login page.

## Rebuild order (suggested)

1. Global colors + header/footer.
2. Login + Portal pages (so auth works end-to-end).
3. Request Access + Contact (lead capture live early).
4. Home (with the hero decision from §4).
5. Remaining marketing + policy pages.
6. Migrate Supabase data, then verify products/resources render in the portal.
