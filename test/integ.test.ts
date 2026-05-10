import * as Cloudflare from "alchemy/Cloudflare";
import * as Test from "alchemy/Test/Bun";
import { expect } from "bun:test";
import * as Effect from "effect/Effect";
import Stack from "../alchemy.run.ts";
import { Schema } from "effect";
import { urlKeySchema } from "../src/url-storage.ts";

const { test, beforeAll, afterAll, deploy, destroy } = Test.make({
    providers: Cloudflare.providers(),
    state: Cloudflare.state(),
});

const stack = beforeAll(deploy(Stack));

test(
    "main user happy path works",
    Effect.gen(function* () {
        const { url } = yield* stack;

        const urlToBeShortened = "https://www.google.com";

        const postRes = yield* Effect.promise(() => fetch(url!, { method: "POST", body: JSON.stringify({ url: urlToBeShortened }), headers: { "content-type": "application/json" } }))

        const urlKey = yield* Effect.promise(async () => await postRes.text());

        expect(postRes.status).toBe(203);
        const decodedUrlKey = yield* Schema.decodeEffect(urlKeySchema)(urlKey).pipe(Effect.orDie);

        const getRes = yield* Effect.promise(() => fetch(`${url}/${decodedUrlKey}`, { method: "GET", redirect: "manual" }));
        expect(getRes.status).toBe(302);

        expect(getRes.headers.get("location")).toBe(urlToBeShortened);

    }),
);

afterAll(destroy(Stack));
