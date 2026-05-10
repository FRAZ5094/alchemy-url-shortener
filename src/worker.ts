import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import { HttpServerRequest } from "effect/unstable/http/HttpServerRequest";
import { HttpServerResponse } from "effect/unstable/http";
import { urlKeySchema, UrlNotFoundError, UrlStorage, UrlStorageLive } from "./url-storage";
import { Match, Schema } from "effect";
import { Kv } from "./Kv";

const mapErrorToTag =
    <const Tag extends string, const Details extends Record<string, unknown> = {}>(
        tag: Tag,
        details?: Details,
    ) =>
        <A, E, R>(effect: Effect.Effect<A, E, R>) =>
            effect.pipe(
                Effect.mapError((cause) => ({
                    ...(details ?? {} as Details),
                    _tag: tag,
                    cause,
                })),
            );

export const reportError = Effect.tapError((error) => Effect.logError(error));

const handlePost = Effect.gen(function* () {
    const urlStorage = yield* UrlStorage;
    const request = yield* HttpServerRequest;

    const json = (yield* request.json) as { url?: string };
    const url = yield* Effect.fromNullishOr(json.url).pipe(
        mapErrorToTag("UrlMissingInBody", { body: json }),
    );

    const key = yield* urlStorage.storeUrl(url);

    return HttpServerResponse.text(key, { status: 203 });

}).pipe(
    reportError,
    Effect.catchTags({
        UrlMissingInBody: () =>
            Effect.succeed(HttpServerResponse.text("Url required in post body", { status: 400 })),
    }),
);

const handleGet = Effect.gen(function* () {
    const urlStorage = yield* UrlStorage;
    const request = yield* HttpServerRequest;

    const key = yield* Effect.fromNullishOr(request.url.split("/").pop()).pipe(
        mapErrorToTag("NoKeyGiven", { url: request.url }),
    );

    const validatedKey = yield* Schema.decodeEffect(urlKeySchema)(key).pipe(
        mapErrorToTag("InvalidUrlKeyError", { key }),
    );

    const url = yield* urlStorage.getUrl(validatedKey)

    return HttpServerResponse.redirect(url, { status: 302 });
}).pipe(
    reportError,
    Effect.catchTags({
        InvalidUrlKeyError: () =>
            Effect.succeed(HttpServerResponse.text("Invalid key", { status: 400 })),
        UrlNotFoundError: () =>
            Effect.succeed(HttpServerResponse.text("Not found", { status: 404 })),
        NoKeyGiven: () =>
            Effect.succeed(HttpServerResponse.text("No key was given in the url", { status: 400 })),
    }),
);

export const fetchHandler = Effect.gen(function* () {
    const request = yield* HttpServerRequest;

    const handle404 = Effect.succeed(HttpServerResponse.text("Not found", { status: 404 }))

    return yield* Match.value(request.method).pipe(
        Match.when("POST", () => handlePost),
        Match.when("GET", () => handleGet),
        Match.orElse(() => handle404),
    )

});

export default Cloudflare.Worker(
    "UrlShortenerWorker",
    { main: import.meta.path },
    Effect.gen(function* () {
        const kv = yield* Cloudflare.KVNamespace.bind(Kv).pipe(
            Effect.provide(Cloudflare.KVNamespaceBindingLive),
        );

        return {
            fetch: fetchHandler.pipe(
                Effect.catchCause((cause) =>
                    Effect.logError(cause).pipe(
                        Effect.as(HttpServerResponse.text("Internal Server Error", { status: 500 })),
                    )
                ),
                Effect.provide(UrlStorageLive(kv)),
            ),
        };
    }),
);
