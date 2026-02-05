# Specification

## Summary
**Goal:** Regenerate the project build and refresh the live preview link/button to point to the newly generated preview build without changing application functionality.

**Planned changes:**
- Regenerate the preview build artifact.
- Refresh/update the Preview action/link in the interface to target the newly generated preview build.
- Ensure no backend state migrations or data model changes occur as part of the regeneration.

**User-visible outcome:** The user can open the interface and use the Preview link/button to access the newly regenerated, up-to-date preview build.
