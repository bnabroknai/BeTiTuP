## 2025-05-14 - [CRITICAL] PII Leakage in Firestore Error Handling
**Vulnerability:** The `handleFirestoreError` function was logging and throwing a stringified object containing the user's UID and Email (PII) upon any Firestore error.
**Learning:** Default error handling patterns that log the entire state for debugging can inadvertently expose sensitive user data to client-side logs and the UI.
**Prevention:** Sanitize all error objects before logging. Never include PII or internal system paths in errors thrown to the UI. Use generic error messages for end-users while keeping detailed (but sanitized) logs for developers.
