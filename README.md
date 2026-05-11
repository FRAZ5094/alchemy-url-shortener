# alchemy-url-shortener

To install dependencies:

```bash
bun install
```

To run the Alchemy worker locally:

```bash
bun run dev
```

To deploy:

```bash
bun run deploy:dev
```

The Vite frontend is built from `web/` and attached to the URL shortener Worker as static assets. The frontend calls `POST /api`, and generated short links use `GET /:key` on the same origin.

Note: with the current Alchemy beta, `alchemy dev` runs the worker locally but does not expose the `props.assets` binding in the local sidecar. Use `bun run deploy:dev` to verify the full single-URL static asset flow on Cloudflare.
