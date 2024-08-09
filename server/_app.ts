import { ftoRouter } from "./router/fto";
import { pairRouter } from "./router/pair";
import { priceFeedRouter } from "./router/priceFeed";
import { indexerFeedRouter } from "./router/indexer";
import { publicProcedure, router, t } from "./trpc";

export const appRouter = router({
  pair: pairRouter,
  fto: ftoRouter,
  priceFeed: priceFeedRouter,
  indexerFeedRouter: indexerFeedRouter,
});
// Export only the type of a router!
// This prevents us from importing server code on the client.
export type AppRouter = typeof appRouter;

const createCaller = t.createCallerFactory(appRouter);
export const caller = createCaller({
  user: null,
});
