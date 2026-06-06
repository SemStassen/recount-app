# Integrations

The Integrations context describes how Recount relates to external providers and provider-owned objects.

## Language

**External Project**:
A provider-owned project-like object that can be listed from an integration provider.
_Avoid_: Recount Project, synced project

**External Task**:
A provider-owned task-like object that can be listed from an integration provider.
_Avoid_: Recount Task, todo

**Linking**:
Associating an existing Recount object with an external provider object.
_Avoid_: Sync, import

**Importing**:
Creating or updating Recount objects from external provider objects.
_Avoid_: Linking, sync

**Sync**:
Keeping already-linked Recount objects aligned with external provider objects over time.
_Avoid_: Import, one-time fetch

## Flagged ambiguities

- **Integration Connection** scope may expand beyond workspaces later; current connections are workspace-scoped.
- **External References** identify provider objects, not the specific **Integration Connection** that created them.
- An **External Reference** can remain after an **Integration Connection** is disconnected.
- Disconnecting an **Integration Connection** stops access, import, and sync but should not delete **External References** by default.
- External object **Linking** vs **Importing** is unresolved; a Recount object may be manually linked to a provider object or created from one during import.
- Integration **Import** and **Sync** vocabulary is unresolved; import likely creates or updates Recount objects from external provider objects, while sync likely keeps already-linked objects aligned over time.
