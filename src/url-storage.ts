import { Context, Data, Effect, Layer, Random, Schema } from "effect";
import * as Cloudflare from "alchemy/Cloudflare";

export const urlKeySchema = Schema.String.pipe(Schema.check(Schema.isUUID(4)), Schema.brand("UrlKey"))

type UrlKey = typeof urlKeySchema.Type;

export class UrlNotFoundError extends Data.TaggedError("UrlNotFoundError")<{}> { }


export interface UrlStorage {
    getUrl(key: UrlKey): Effect.Effect<string, UrlNotFoundError | Cloudflare.KVNamespaceError>;
    storeUrl(url: string): Effect.Effect<string, Cloudflare.KVNamespaceError>;
}

export const UrlStorage = Context.Service<UrlStorage>("UrlStorage");

export const UrlStorageLive = (kv: Cloudflare.KVNamespaceClient) => Layer.effect(UrlStorage, Effect.gen(function* () {
    const env = yield* Cloudflare.WorkerEnvironment;
    const provideWorkerEnv = Effect.provideService(Cloudflare.WorkerEnvironment, env);
    const generateKey = Random.nextUUIDv4.pipe(Effect.map(urlKeySchema.make))

    return {
        getUrl: (key: string) =>
            kv.get(key).pipe(
                Effect.filterOrFail(
                    (url): url is string => url !== null,
                    () => new UrlNotFoundError(),
                ),
                provideWorkerEnv,
            ),
        storeUrl: (url: string) => generateKey.pipe(
            Effect.tap((key) => kv.put(key, url)),
            provideWorkerEnv,
        )
    }
}))
