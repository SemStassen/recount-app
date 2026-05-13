import type { LandingWorkerEnv } from "./worker-env";

export default {
  async fetch(request: Request, env: LandingWorkerEnv) {
    const url = new URL(request.url);

    if (url.pathname === "/api/waitlist") {
      if (request.method !== "POST") {
        return new Response("Method Not Allowed", {
          status: 405,
          headers: { Allow: "POST" },
        });
      }

      return Response.json({
        ok: true,
        message: "pong",
      });
    }

    if (url.pathname === "api/waitlist/confirm") {
      if (request.method !== "GET") {
        return new Response("Method Not Allowed", {
          status: 405,
          headers: { Allow: "GET" },
        });
      }

      return Response.json({
        ok: true,
        message: "pong",
      });
    }

    return env.ASSETS.fetch(request);
  },
};
