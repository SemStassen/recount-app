import { renderRecountInterface } from "@recount/interface";
import { NoopScreenContextProviderLayer } from "@recount/interface/screen-context";
import type { ScreenContextProviderId } from "@recount/interface/screen-context";

import {
  ScreenpipeScreenContextProviderLayer,
  ShadowScreenContextProviderLayer,
} from "./screen-context";

const desktopScreenContextProvider =
  "screenpipe" satisfies ScreenContextProviderId;

const screenContextProviderLayer = {
  screenpipe: ScreenpipeScreenContextProviderLayer,
  shadow: ShadowScreenContextProviderLayer,
  none: NoopScreenContextProviderLayer,
}[desktopScreenContextProvider];

renderRecountInterface({
  screenContextProviderLayer,
});
