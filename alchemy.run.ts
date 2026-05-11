import * as Alchemy from "alchemy";
import * as Build from "alchemy/Build";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import { createWorker } from "./src/worker";

export default Alchemy.Stack(
    "UrlShortener",
    {
        providers: Cloudflare.providers(),
        state: Cloudflare.state(),
    },
    Effect.gen(function* () {
        const webBuild = yield* Build.Command("UrlShortenerWebBuild", {
            cwd: "./web",
            command: "bun run build",
            outdir: "dist",
        });

        const worker = yield* createWorker({
            assets: {
                path: webBuild.outdir,
                hash: webBuild.hash,
                config: {
                    runWorkerFirst: true,
                    notFoundHandling: "single-page-application",
                },
            },
        } as any);

        return {
            url: worker.url,
        }
    }),
);
