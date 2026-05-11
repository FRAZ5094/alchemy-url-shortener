import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Output from "alchemy/Output";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import { Kv } from "./src/Kv";
import Worker from "./src/worker";

const getWorkersDevSubdomain = Effect.gen(function* () {
    const env = yield* Cloudflare.CloudflareEnvironment;
    const headers: Record<string, string> = {
        "content-type": "application/json",
    };

    if (env.type === "apiToken") {
        headers.authorization = `Bearer ${Redacted.value(env.apiToken)}`;
    } else if (env.type === "oauth") {
        headers.authorization = `Bearer ${Redacted.value(env.accessToken)}`;
    } else {
        headers["x-auth-email"] = Redacted.value(env.email);
        headers["x-auth-key"] = Redacted.value(env.apiKey);
    }

    const response = yield* Effect.promise(() =>
        fetch(
            `https://api.cloudflare.com/client/v4/accounts/${env.accountId}/workers/subdomain`,
            { headers },
        ),
    );

    if (!response.ok) {
        throw new Error(`Unable to read Cloudflare workers.dev subdomain: ${response.status}`);
    }

    const body = (yield* Effect.promise(() => response.json())) as {
        result?: { subdomain?: string };
    };

    if (!body.result?.subdomain) {
        throw new Error("Cloudflare workers.dev subdomain response did not include a subdomain");
    }

    return body.result.subdomain;
});

export default Alchemy.Stack(
    "UrlShortener",
    {
        providers: Cloudflare.providers(),
        state: Cloudflare.state(),
    },
    Effect.gen(function* () {
        yield* Kv;
        const worker = yield* Worker;
        const workersDevSubdomain = yield* getWorkersDevSubdomain;

        const web = yield* Cloudflare.StaticSite("UrlShortenerWeb", {
            cwd: "./web",
            command: Output.map(worker.workerName, (workerName) => {
                const url = `https://${workerName}.${workersDevSubdomain}.workers.dev`;
                return `VITE_URL_SHORTENER_URL=${url} bun run build`;
            }),
            outdir: "dist",
            main: "./web/worker.ts",
            assetsConfig: {
                notFoundHandling: "single-page-application",
            },
        });

        return {
            url: worker.url,
            web: web.url,
        }
    }),
);
