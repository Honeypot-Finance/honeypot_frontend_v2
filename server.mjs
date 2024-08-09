/**
 * https://nextjs.org/docs/pages/building-your-application/configuring/custom-server
 */
import { createServer } from "node:http";
import next from "next";
import { launchEditorMiddleware } from "@react-dev-inspector/middleware";

const dev = process.env.NODE_ENV !== "production";

const hostname = process.env.HOST || "localhost";
const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const app = next({
  dev,
  hostname,
  port,
});
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    /**
     * middlewares, from top to bottom
     */
    const middlewares = [
      /** `react-dev-inspector` server config for nextjs */
      launchEditorMiddleware,

      /** Next.js default app handler as middleware */
      (req, res) => handle(req, res),
    ];

    const middlewarePipeline = middlewares.reduceRight(
      (next, middleware) => () => {
        middleware(req, res, next);
      },
      () => {}
    );

    try {
      middlewarePipeline();
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  })
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.debug(`\n > Ready on http://${hostname}:${port} \n`);
    });
});
