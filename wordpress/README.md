# Synthera — WordPress + Elementor conversion

This folder converts the original **synthera-revamp** app (React 19 + TanStack Start + Supabase) into a WordPress site where:

- **Public marketing pages** are built visually in **Elementor**.
- **Auth, roles, portals, products, requests, documents and resources** are provided by the custom **`synthera-portal`** plugin.

> **Why a plugin and not "just Elementor"?** Elementor is a page/layout builder — it draws pages, it does not build authentication, role-gated portals, request workflows, private document delivery, or database logic. Those features (about 70% of this app) are implemented in PHP by the plugin. The two work together: Elementor for the look, the plugin for the logic.

There is **no automatic converter** from React/Supabase to WordPress — the stacks are incompatible (React/TypeScript/Postgres vs. PHP/MySQL). This is a faithful re-implementation of the same feature set on WordPress primitives.

---

## What maps to what

| Original (Supabase / React) | WordPress implementation |
|---|---|
| `auth.users` | `wp_users` |
| `user_roles` enum `admin` / `customer` | Roles: `administrator` + custom `syn_customer` |
| `has_role(uid,'admin')` (RLS) | `current_user_can('synp_manage_portal')` checks in PHP |
| `profiles` | User meta (`synp_company`, `synp_job_title`, `synp_country`, `synp_phone`) |
| `products` + `categories` | CPT `syn_product` + taxonomy `syn_area` (+ product meta) |
| `resources` | CPT `syn_resource` |
| `access_requests` | Table `{prefix}syn_access_requests` |
| `product_requests` (statuses) | Table `{prefix}syn_product_requests` |
| `product_documents` + private bucket | Table `{prefix}syn_product_documents` + `uploads/synthera-private/` + gated download endpoint |
| `contact_submissions` | Table `{prefix}syn_contact` |
| `_authenticated` route gate | `template_redirect` gate + `synp_access_portal` cap |
| 3D Three.js DNA hero | Static image/video, or embed the compiled JS (see Elementor guide) |

## Feature parity checklist

- [x] Login / logout (WordPress auth) — `[synthera_login]`, "Welcome to Synthera"
- [x] Forgot / reset password (WordPress built-in `wp_lostpassword_url()`)
- [x] Request Access form (public) → creates access request → admin approves → customer account created — `[synthera_request_access]`
- [x] Customer portal (gated): dashboard, products, product detail, requests, documents, profile, support — `[synthera_portal]`
- [x] Product requests with statuses: Pending, Under Review, Approved, Completed, Rejected
- [x] Private product documents with signed, login-gated downloads
- [x] Admin portal: dashboard, access requests (approve/reject), product requests (status), inquiries, products, resources
- [x] Resources (public list + detail) — `[synthera_resources]` + CPT archive
- [x] Contact form — `[synthera_contact]`
- [x] Data migration from Supabase (`wp synthera migrate`)

---

## Requirements

- Self-hosted WordPress **6.4+**, PHP **8.0+** (a plan that allows **custom plugins** — WordPress.com below Business will not work).
- **Elementor** (free is enough for the pages; Pro adds Theme Builder for header/footer/forms).
- Apache, or Nginx with a rule blocking `uploads/synthera-private/` (see below).

## Installation

1. Copy the `synthera-portal/` folder into `wp-content/plugins/`.
2. In **wp-admin → Plugins**, activate **Synthera Portal**. Activation creates the `syn_customer` role, the custom tables, and the private uploads directory.
3. Install and activate **Elementor**.
4. Create the pages listed in [`ELEMENTOR-GUIDE.md`](./ELEMENTOR-GUIDE.md) and drop the shortcodes where indicated.
5. Go to **Synthera Portal → Settings** and select your **Portal page** (contains `[synthera_portal]`) and **Login page** (contains `[synthera_login]`).
6. (Optional) Migrate your Supabase data — see below.

## Migrating your Supabase data

Export these queries from the Supabase SQL editor as JSON files (see the header of `includes/class-synp-migrate-cli.php` for the exact SQL): `categories.json`, `products.json`, `resources.json`, `users.json`. Then:

```bash
wp synthera migrate --dir=/path/to/exports
# or one entity at a time:
wp synthera migrate --dir=/path/to/exports --only=products
# email new users a password-set link:
wp synthera migrate --dir=/path/to/exports --only=users --notify
```

> **Passwords do not transfer.** Supabase and WordPress hash passwords differently, so imported users must reset their password (the `--notify` flag emails them a link). This is expected and unavoidable.

## Nginx note (private documents)

On Apache the plugin writes an `.htaccess` deny rule automatically. On **Nginx**, add:

```nginx
location ^~ /wp-content/uploads/synthera-private/ { deny all; return 403; }
```

Customers still download documents through the gated endpoint (`?synp_doc=<id>&_wpnonce=…`), which streams the file after checking login + nonce.

## What is NOT auto-converted (do manually)

- **3D DNA hero** — Elementor has no Three.js widget. Options: (a) export a short video/loop of the hero and use it as a background; (b) use a static hero image (`src/assets/synthera-cinematic-dna-hero.jpg`); (c) advanced: build the React hero as a standalone bundle and embed via an HTML widget. See the Elementor guide.
- **Exact visual design** — Elementor rebuilds are layout work. Use the original pages as the reference; brand tokens (dark teal `#05201f`, accent `#17c3b2`) are in `synthera-portal/assets/portal.css`.
- **Cart / checkout / orders / wishlists / addresses** — the current app already removed the shop; these Supabase tables are intentionally not reproduced. Add WooCommerce later only if you reintroduce buying.

## File map

```
wordpress/
├── README.md                     ← this file
├── ELEMENTOR-GUIDE.md            ← page-by-page rebuild instructions
└── synthera-portal/              ← the custom plugin (copy to wp-content/plugins/)
    ├── synthera-portal.php       ← bootstrap, activation
    ├── assets/portal.css
    └── includes/
        ├── class-synp-roles.php
        ├── class-synp-helpers.php
        ├── class-synp-schema.php
        ├── class-synp-post-types.php
        ├── class-synp-access-requests.php
        ├── class-synp-product-requests.php
        ├── class-synp-documents.php
        ├── class-synp-customer-portal.php
        ├── class-synp-admin-screens.php
        ├── class-synp-shortcodes.php
        └── class-synp-migrate-cli.php
```
