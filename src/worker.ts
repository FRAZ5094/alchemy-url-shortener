import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import { Kv } from "./Kv";
import { HttpServerRequest } from "effect/unstable/http/HttpServerRequest";
import { HttpServerResponse } from "effect/unstable/http";


export default Cloudflare.Worker(
    "UrlShortenerWorker",
    { main: import.meta.path },
    Effect.gen(function* () {
        const kv = yield* Cloudflare.KVNamespace.bind(Kv);

        const putUrl = (url: string) => Effect.gen(function* () {
            const key = crypto.randomUUID().toString();
            yield* kv.put(key, url);
            return key;
        });

        const getUrl = (key: string) => Effect.gen(function* () {
            const url = yield* kv.get(key);
            return url;
        });

        return {
            fetch: Effect.gen(function* () {
                const request = yield* HttpServerRequest;
                if (request.method === "POST") {
                    const json = (yield* request.json) as { url?: string };

                    if (!json.url) {
                        return HttpServerResponse.text("Invalid request: url is required", { status: 400 });
                    }
                    const key = yield* putUrl(json.url);

                    return HttpServerResponse.text(key, { status: 203 });
                }
                if (request.method === "GET") {
                    const key = request.url.split("/").pop();
                    if (!key) {
                        return HttpServerResponse.text("Invalid request: key is required", { status: 400 });
                    }
                    const url = yield* getUrl(key);
                    if (!url) {
                        return HttpServerResponse.text("Not found", { status: 404 });
                    }
                    return HttpServerResponse.redirect(url, { status: 302 });
                }

                return HttpServerResponse.text("Not found", { status: 404 });

            }).pipe(
                Effect.catchCause((cause) =>
                    Effect.logError(cause).pipe(
                        Effect.andThen(() => Effect.succeed(HttpServerResponse.text("Internal Server Error", { status: 500 })))
                    )
                ),
            ),
        };


    }).pipe(Effect.provide(Cloudflare.KVNamespaceBindingLive)),
);