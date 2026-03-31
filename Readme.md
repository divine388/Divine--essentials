diff --git a/README.md b/README.md
index 37d56a0f8763589c01bb70dd71bf1e50aafd027f..c2e3a8a245910548573d6339ce8af2477d0ffbcf 100644
--- a/README.md
+++ b/README.md
@@ -1,2 +1,48 @@
-# Divine--essentials
-Divine Essentials is a premium spiritual ecommerce brand offering authentic products to bring peace, positivity, and balance into your life.
+# Divine Essentials
+
+Divine Essentials is a premium spiritual ecommerce storefront designed as a fast static site.
+
+## What is included
+
+- Responsive static pages for home, products, product detail, cart, checkout, auth, and order confirmation.
+- Client-side utilities for cart, auth, order storage, and international preferences via `localStorage`.
+- Performance-oriented UI with lazy loading, deferred scripts, and mobile-friendly layout behavior.
+- PWA readiness with `manifest.webmanifest`, install prompt support, and offline caching via `sw.js`.
+- Deployment and SEO essentials: `robots.txt`, `sitemap.xml`, `.nojekyll`, and `vercel.json`.
+
+## Deployment guide
+
+### Option 1 — GitHub Pages (automatic)
+
+This repository includes `.github/workflows/pages.yml` for automatic deployment from the `main` branch.
+
+1. Push the repo to GitHub.
+2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
+3. Push to `main` (or run the workflow manually) to deploy.
+
+### Option 2 — Vercel
+
+1. Import the repository into Vercel.
+2. Framework preset: **Other** (Static).
+3. Build command: _empty_.
+4. Output directory: _empty_ (project root).
+5. Deploy.
+
+`vercel.json` is already configured for clean URLs, security headers, and long-lived cache headers for JS/CSS.
+
+## Production checklist
+
+- Validate PWA installability in Chrome DevTools → Application (Manifest + Service Worker).
+
+- Replace Razorpay test key by setting `window.RAZORPAY_KEY` from a secure config method.
+- Update canonical URLs in all HTML files to your final production domain.
+- Verify sitemap domain (`sitemap.xml`) matches production URL.
+- Run a mobile smoke test (360px, 768px, 1024px widths).
+
+## Local preview
+
+```bash
+python -m http.server 8080
+```
+
+Then open `http://localhost:8080`.
