import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { Kv } from "./src/Kv";
import Worker from "./src/worker";

export default Alchemy.Stack(
    "UrlShortener",
    {
        providers: Cloudflare.providers(),
        state: Cloudflare.state(),
    },
    Effect.gen(function* () {
        yield* Kv;
        const worker = yield* Worker;

        return {
            url: worker.url,
        }
    }),
);