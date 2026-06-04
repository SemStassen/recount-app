# Model Boundaries

Recount separates persistence records from caller-facing entity models when the
database shape and product vocabulary diverge.

## Persistence Records

Drizzle is the source of truth for database tables, indexes, foreign keys, and
storage-level nullability. `RecordModel` describes decoded repository boundary
records with `select`, `insert`, and `update` variants when `@recount/core` needs
schema-backed persistence shapes without depending on `@recount/db`.

Persistence records describe storage. They can encode nullable columns,
migration history, and database constraints. They should not become the language
used by RPC payloads, module Interfaces, or optimistic UI actions.

## Entity Models

`EntityModel` describes caller-facing entity and API contracts with `json`,
`jsonCreate`, and `jsonUpdate` variants. Entity models should use Recount
product vocabulary and expose the fields that callers need for a domain concept.

The legacy combined `Model` helper remains for backwards compatibility while
modules migrate incrementally. New record/entity splits should prefer
`RecordModel` and `EntityModel` over adding more persistence/entity overlap to
the combined helper. Prefer small explicit mapping functions at repository and
module seams.

## Time Entry Validation Case

Time Entry is the first validation point for this pattern. The database stores
stopped **Time Entries** and **Running Time Entries** in one table, where
nullable `stoppedAt` identifies a running record. The product vocabulary has two
caller-facing lifecycle concepts:

- **Time Entry**: a completed interval with required `stoppedAt`.
- **Running Time Entry**: an active interval with no caller-facing `stoppedAt`.

The Time module is the translation seam between persistence records and these
lifecycle entities. Repository Adapters deal with storage records; module, RPC,
and Local Workspace State actions deal with lifecycle models.

Apply this split to other modules only when storage shape and domain shape
actually diverge.
