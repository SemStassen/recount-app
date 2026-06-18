import { startOfMinute } from "date-fns";
import { Atom } from "effect/unstable/reactivity";

const ONE_MINUTE_IN_MS = 60 * 1000;

export const currentTimeAtom = Atom.writable(
  (get) => {
    const tick = () => get.setSelf(startOfMinute(new Date()));
    const delay = ONE_MINUTE_IN_MS - (Date.now() % ONE_MINUTE_IN_MS);
    let interval: ReturnType<typeof setInterval> | undefined;

    const timeout = setTimeout(() => {
      tick();
      interval = setInterval(tick, ONE_MINUTE_IN_MS);
    }, delay);

    get.addFinalizer(() => {
      clearTimeout(timeout);

      if (interval !== undefined) {
        clearInterval(interval);
      }
    });

    return startOfMinute(new Date());
  },
  (ctx, currentTime: Date) => {
    ctx.setSelf(startOfMinute(currentTime));
  }
).pipe(Atom.keepAlive);
