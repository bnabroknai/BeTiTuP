## 2026-05-19 - [Accessibility & External Integration]
**Learning:** High-contrast "Pro" themes benefit greatly from custom `focus-visible` indicators that match the branding (e.g., emerald rings). When adding external links to dense UI components (like GameCards), use `e.stopPropagation()` on nested interactive elements to prevent parent click handlers from firing unexpectedly.
**Action:** Always verify keyboard navigation after adding nested interactive elements. Ensure external links have appropriate `rel="noopener noreferrer"` for security.
