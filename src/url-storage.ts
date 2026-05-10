import { Context, Data, Effect, Layer, Random, Schema } from "effect";
import * as Cloudflare from "alchemy/Cloudflare";
import { Kv } from "./Kv";

export const urlKey = Schema.String.pipe(Schema.check(Schema.isUUID(4)), Schema.brand("UrlKey"))

type UrlKey = typeof urlKey.Type;

export class UrlNotFoundError extends Data.TaggedError("UrlNotFoundError")<{}> { }


export interface UrlStorage {
    getUrl(key: UrlKey): Effect.Effect<string, UrlNotFoundError>;
    storeUrl(url: string): Effect.Effect<string>;
}

export const UrlStorage = Context.Service<UrlStorage>("UrlStorage");

export const UrlStorageLive = Layer.effect(UrlStorage, Effect.gen(function* () {
    const kv = yield* Cloudflare.KVNamespace.bind(Kv);
    const env = yield* Cloudflare.WorkerEnvironment;
    const provideWorkerEnv = Effect.provideService(Cloudflare.WorkerEnvironment, env);

    const generateKey = Random.nextUUIDv4.pipe(Effect.map(urlKey.make))

    return {
        getUrl: (key: string) =>
            kv.get(key).pipe(
                Effect.orDie,
                Effect.filterOrFail(
                    (url): url is string => url !== null,
                    () => new UrlNotFoundError(),
                ),
                provideWorkerEnv,
            ),
        storeUrl: (url: string) => generateKey.pipe(
            Effect.tap((key) => kv.put(key, url)),
            Effect.orDie,
            provideWorkerEnv,
        )
    }
}).pipe(Effect.provide(Cloudflare.KVNamespaceBindingLive)))
