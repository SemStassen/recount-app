# Interface Session Module

The Interface Session Module owns frontend state with authenticated-user session lifetime.

## Module boundary

The session module owns:

- session and workspace-list atoms used at app bootstrap
- `UserDb` lifecycle, provider, and React hook
- session-scoped local collections such as user settings

Shared authenticated transport stays in `interface/src/lib/auth` because workspace-scoped code also uses it. Shared Electric collection definitions stay in `interface/src/db/synced-collections`.

Consumers should import from `~/modules/session`, not from session internals.
