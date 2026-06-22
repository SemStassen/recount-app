# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

This repo uses a root `CONTEXT.md` as the project glossary and may add nested `CONTEXT.md` files for module or bounded-context vocabulary. Architectural decisions live in the root `docs/adr/` directory.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root.
- Any nested **`CONTEXT.md`** near the code you are about to work in.
- **`docs/adr/`** at the repo root; read ADRs that touch the area you're about to work in.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The producer skill (`/grill-with-docs`) creates them lazily when terms or decisions actually get resolved.

## File structure

```text
/
|-- CONTEXT.md
|-- docs/adr/
|   |-- 0001-example-decision.md
|   `-- 0002-example-decision.md
|-- packages/*/**/CONTEXT.md
|-- interface/**/CONTEXT.md
`-- ...
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/grill-with-docs`).

## Maintain the context shape

When updating `CONTEXT.md` files, preserve the project glossary structure:

- `## Language` defines canonical terms, each with a short definition and `_Avoid_` alternatives when useful.
- `## Relationships` records durable facts between domain terms, especially ownership, lifecycle, and cross-workspace boundaries.
- `## Example dialogue` captures a concrete ambiguity when it would prevent future terminology drift.
- `## Flagged ambiguities` lists unresolved decisions, reserved vocabulary, and terms that are easy to misuse.

Nested `CONTEXT.md` files should narrow the same structure to their module or bounded context instead of repeating the full root glossary. Add a nested context only when local vocabulary or relationships would otherwise be easy to miss from the root glossary.

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (event-sourced orders), but worth reopening because..._
