# Calendar Drag And Drop Refactor Notes

## Goal

Refactor `interface/src/features/calendar/` so the calendar does not render a
`DroppableTimeEntry` for every visible time slot. The calendar should instead
use one grid-level interaction surface and derive the target slot from pointer
geometry.

## Agreed Decisions

1. The calendar grid is the canonical interaction surface.
2. Slot hit-testing should be based on pointer coordinates, not many rendered
   droppable nodes.
3. The same grid geometry should work for one visible day and multiple visible
   days.
4. Once a valid calendar gesture starts, pointer positions clamp to the visible
   grid.
5. Horizontal clamping resolves to the nearest visible day. Inferring non-visible
   days is future work for a horizontally infinite calendar.
6. Vertical clamping respects `FIRST_VISIBLE_HOUR` and `LAST_VISIBLE_HOUR`.
7. `LAST_VISIBLE_HOUR` is an exclusive end boundary.
8. Use `CalendarSlot` as the code term for a resolved visible calendar slot.
9. A `CalendarSlot` should include the full interval: `start` and `end`.
10. The calendar selection state should store chronological ranges with
    `{ startedAt, stoppedAt }`, not slots.
11. `startedAt` should always be earlier than `stoppedAt`.
12. Slot duration is the canonical configuration. Use a global
    `CALENDAR_SLOT_DURATION_MINUTES`, initially `15`.
13. Derive slots per hour from the slot duration.
14. Validate that the slot duration divides an hour evenly.
15. Render only what is visually needed. Keep hour rows; do not render invisible
    per-slot elements.
16. Pointer handling for empty-slot selection belongs on the shared grid surface,
    not in each `DayColumn`.
17. Existing time entries should be marked with `data-calendar-entry` so empty
    grid selection can ignore pointer-downs that start on an entry.
18. Do not add broader interactive-element guards yet.
19. Inline the `data-calendar-entry` guard for now.
20. Keep `useCalendarDragSelection`, but remove its DOM listener responsibility.
    The grid owns pointer events and geometry; the hook owns selection state and
    commit behavior.
21. Pointer-down on an empty slot should select the initial slot immediately.
22. A simple click on an empty slot should open create for one slot.
23. Drag-selection should include the slot under the pointer.
24. When selecting forward, use the target slot end. When selecting backward, use
    the target slot start.
25. Cross-day empty-slot selection is allowed.
26. Cross-day empty-slot selection creates one continuous interval, not multiple
    per-day blocks.
27. Commit should pass the stored chronological selection range directly to
    `openCreateTimeEntryEditor`.
28. Keep the existing per-day `DragSelectionHighlight` rendering via
    `TimeEntryFrame`.
29. The hour column is outside the calendar interaction surface.
30. Empty-slot selection starts only when pointer-down starts inside the grid.
31. After a valid selection starts, pointer movement outside the grid clamps to
    the grid.
32. Use pointer capture for calendar selection.
33. `pointerup` commits the selection.
34. `pointercancel` cancels the selection and clears state.
35. Suppress native text selection during calendar drag-selection.
36. Add vertical auto-scroll for empty-slot drag-selection in the first pass.
37. Auto-scroll should be proportional to how close the pointer is to the
    viewport edge.
38. Auto-scroll should continue if the pointer leaves the viewport vertically
    while the gesture is active.
39. Selection should update during auto-scroll frames even if no new pointermove
    event fires.
40. Slot hit-testing should use content-relative vertical geometry with the
    scroll viewport's `scrollTop`.
41. Dnd-kit should be used as the drag gesture engine, not the source of slot
    truth.
42. Replace the many slot droppables with one stable grid-level droppable, e.g.
    `calendar-grid`.
43. Delete `DroppableTimeEntry` if it becomes unused.
44. Existing time-entry movement should preserve the original duration.
45. Moving an entry may cross midnight.
46. Dropping an entry should open the update sidebar with the moved time range
    previewed, not persist immediately.
47. Dragging an entry should open/update the sidebar only after drop, not on drag
    start.
48. Dropping onto the same slot should still open the update sidebar.
49. Entry drags that end outside the grid should clamp to the nearest visible
    slot, because the drag started as a valid calendar gesture.
50. Entry drag-drop should change only `startedAt` and `stoppedAt`; project,
    task, and notes should be preserved.
51. Extend `openUpdateTimeEntryEditor` with optional `initialRange` rather than
    adding a separate move editor action.
52. Store the dropped update range in `calendarEditorAtom`, not directly in
    `calendarEditingPreviewAtom`.
53. The update form should remain the source of truth for update previews.
54. If a dropped range changes while the update editor is already open, update
    only the time fields and preserve non-time edits.
55. Avoid `useEffect` for form syncing if there is a clean form/action path, but
    a small scoped effect is acceptable as a last resort.
56. Latest drop wins for the time fields.
57. Keep click-to-update behavior for existing entries.
58. Keep whole-card dragging for existing entries in this refactor.
59. Skip drag activation threshold work for now.
60. Stop at opening the update sidebar with changed form values; do not add
    automatic mutation on drop.
61. Put geometry helpers in the existing
    `components/views/calendar-multi-day-view/layout.ts` for now.
62. Use existing `date-fns` helpers for date construction and simple numeric math
    for pointer-to-index calculations.
63. Add focused Vitest tests for geometry.
64. Put tests in `interface/tests/calendar/calendar-grid-geometry.test.ts`.
65. Use plain rect-like objects in tests rather than real DOM `DOMRect`s.
66. Add an `interface` package `test` script using Vitest.

## Implementation Scope

1. Replace per-slot `DroppableTimeEntry` rendering with one grid-level droppable.
2. Add `CALENDAR_SLOT_DURATION_MINUTES` and derive slot counts from it.
3. Add pure geometry helpers in `layout.ts`.
4. Move empty-slot pointer handling to the shared grid surface.
5. Support click-to-create, cross-day drag selection, clamping, pointer capture,
   and vertical auto-scroll.
6. Extend update editor state/actions to accept a dropped time range.
7. Keep existing entry click-to-update behavior.
8. On entry drop, open the update sidebar with changed time fields and no
   automatic mutation.
9. Delete `DroppableTimeEntry` if unused.
10. Add Vitest coverage for geometry.
11. Add an `interface` package `test` script.

## Deferred Follow-Ups

1. Live move preview while dragging an existing entry.
2. Existing-entry auto-scroll through dnd-kit, unless it is straightforward while
   implementing.
3. Horizontally infinite calendar behavior and horizontal auto-scroll.
4. Keyboard creation/editing from the calendar grid.
5. Dedicated drag handles for existing entries.
6. Drag activation thresholds, if whole-card dragging later conflicts with click
   behavior.
7. Persisted or user-configurable slot duration.
8. Additional guards for buttons, links, inputs, and ARIA interactive roles inside
   the calendar grid.

## Notes

These notes are implementation planning notes, not domain documentation. No
`CONTEXT.md` or ADR is needed yet because the decisions are not domain glossary
terms and are not hard-to-reverse architectural trade-offs.
