---
title: Routing Implementation Plan
date: 2025-11-13
---

# Routing Implementation Plan

## Overview
The current frontend uses tab-based navigation with React state, not URL-based routing. To improve navigation, deep linking, and browser history support, we will implement client-side routing using React Router. This will allow each major view (Data Explorer, Advanced Search, Treemap, API Docs, Help, About) to have its own URL path. Backend and Nginx are already compatible with SPA routing.

## Current State
- **Frontend:**
  - Navigation is handled by `activeTab` state in `App.tsx`.
  - No React Router or route constants are present.
  - No URL changes when switching tabs.
- **Backend:**
  - Django REST API endpoints are namespaced under `/api/v1/` and `/api/v1/data-processing/`.
  - Admin at `/admin/`.
- **Nginx:**
  - Configured for SPA fallback (`try_files $uri /index.html;`).

## Goals
- Enable URL-based navigation for all main views.
- Support deep linking and browser navigation (back/forward).
- Allow direct linking to any view/page.
- Maintain SPA performance and code splitting.


## Step-by-Step Plan

### 1. Install React Router
- Add `react-router-dom` as a dependency in the frontend project.

### 2. Define Route Structure
- Map each tab/view to a route path:
  - `/` → Data Explorer (default)
  - `/advanced-search` → Advanced Search
  - `/treemap` → Treemap
  - `/api-docs` → API Documentation
  - `/help` → Help
  - `/about` → About
- Optionally, add 404 Not Found route.

#### Additional Routing Considerations
- **Detail or Sub-Pages:**
  - For contract details, organization profiles, analytics drill-downs, etc., add routes like `/contracts/:id`, `/organizations/:id`, `/analytics/:type`.
- **Modals or Dialogs:**
  - For deep-linkable modals (e.g., `/help/contact`), add routes that open dialogs or overlays directly from the URL.

### 3. Refactor App Component
- Replace tab state logic with `<Routes>` and `<Route>` components.
- Use `<Link>` or `<NavLink>` for navigation buttons.
- Use `useLocation` and `useNavigate` for programmatic navigation if needed.
- Ensure code splitting/lazy loading is preserved for each route.

### 4. Update Navigation
- Update tab navigation to use router links instead of onClick state changes.
- Highlight active tab based on current route.

### 5. Test SPA Fallback
- Verify that direct navigation to any route works (SPA fallback via Nginx).
- Test browser back/forward and deep links.

### 6. Update Documentation
- Document new routing structure and usage in `frontend/README.md` and developer docs.

### 7. (Optional) Add Route Guards
- If authentication or permissions are needed, add route guards or protected routes.

## Backend & Nginx
- No changes needed for backend API endpoints.
- Nginx config already supports SPA fallback; review for any edge cases.

## References
- [React Router Documentation](https://reactrouter.com/en/main)
- See `frontend/src/pages/README.md` for navigation integration patterns.

---
**Prepared: 2025-11-13**