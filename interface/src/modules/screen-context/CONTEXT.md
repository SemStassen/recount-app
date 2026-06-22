# Interface Screen Context Module

The Interface Screen Context Module owns the frontend contract for reading
ambient screen context from host platform providers.

## Module boundary

The screen context module owns:

- the `ScreenContext` Effect service consumed by interface code
- the `ScreenContextProvider` host-provider contract
- shared screen context query, observation, summary, and error types
- the noop provider used by hosts without screen context support

Host-specific provider implementations stay in host apps, such as
`apps/desktop/src/screen-context`, because they depend on platform services.
Runtime assembly stays in `interface/src/lib/runtime` because it wires host
capabilities into the interface runtime.

Consumers should import from `~/modules/screen-context` inside the interface, or
from `@recount/interface/screen-context` from host apps.
