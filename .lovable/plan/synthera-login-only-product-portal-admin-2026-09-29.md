# Synthera: Login-only Product Portal + Admin

Decisions: replace the shop (no public products, cart, checkout, or buying), any signed-up customer sees products right away, keep the current dark teal cinematic look and DNA hero.

## Public website (no product info anywhere)
- Header: Home, About, Science, Therapeutic Areas, Quality, Resources, Contact, plus Login and a "Request Access" button. Header shrinks on scroll, with a mobile menu.
- Home: hero reading "Advancing Therapeutics Through Science & Innovation", then value cards, about split, therapeutic focus cards, science pipeline, the 5-step approach, why Synthera, quality, insights, and a partnership call to action.
- New pages: Science, Therapeutic Areas, Quality, Resources (list and detail, replacing Journal), Request Access (form with a thank-you state).
- Contact form gets the brief's fields and inquiry types.
- Login page titled "Welcome to Synthera". Policy pages stay.
- Removed: /products, /categories, /cart, /checkout, cart icon, and product teasers on public pages. Old product links redirect to login.

## Customer portal (/customer/*, signed-in users only)
- Sidebar that collapses on mobile: Dashboard, Products, Requests, Documents, Profile, Support, Logout.
- Dashboard: welcome message, counts, recently added products.
- Products: search, filter by therapeutic area, type, and availability, and sorting. Each product has a detail page with overview, science, documents, and a "Request Information" button.
- Requests: table with statuses (Pending, Under Review, Approved, Completed, Rejected).
- Profile: personal and company details, plus password change.
- Support: a form with topics.

## Admin portal (/admin/*, admin role only)
- Dashboard with totals and recent activity.
- Products: list, add, edit, and archive. Fields include SKU, area, type, descriptions, image, documents, and status (Draft, Active, Archived).
- Customers list, Access Requests (approve or reject), Product Requests (change status), Contact Inquiries, and Resources (add and edit articles).

## Technical
- Database: products are readable only by signed-in users. The public role loses product and category access. Anonymous reads are removed from product server functions, and they now require sign-in.
- New tables: access_requests (anyone can submit, admins read), product_requests (owner and admin), resources (public read when published, admin write), and product_documents (stored in a private bucket, with signed links for signed-in users).
- Admin checks happen on the server through has_role. The existing user_roles table is reused.
- Existing orders, wishlists, and addresses stay in the database but are no longer shown.
- Pages sit under the existing signed-in gate. Admin pages get an extra admin check.
