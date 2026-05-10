import { describe, expect, test } from "bun:test";
import * as Effect from "effect/Effect";
import * as HttpServerRequest from "effect/unstable/http/HttpServerRequest";
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";
import { fetchHandler } from "./worker";
import { UrlNotFoundError, UrlStorage, type UrlStorage as UrlStorageService } from "./url-storage";

type MockUrlStorage = Partial<UrlStorageService>

const runFetchHandler = (
    request: Request,
    urlStorage: MockUrlStorage,
) =>
    fetchHandler.pipe(
        Effect.provideService(
            HttpServerRequest.HttpServerRequest,
            HttpServerRequest.fromWeb(request),
        ),
        Effect.provideService(UrlStorage, urlStorage),
        Effect.map((response) => HttpServerResponse.toWeb(response)),
        Effect.runPromise,
    );

describe("fetchHandler", () => {
    test("stores the posted URL and returns the generated key", async () => {
        const storedUrls: Array<string> = [];
        const urlStorage: MockUrlStorage = {
            storeUrl: (url) =>
                Effect.sync(() => {
                    storedUrls.push(url);
                    return "test-key";
                }),
        };

        const response = await runFetchHandler(
            new Request("https://short.example/", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ url: "https://example.com/article" }),
            }),
            urlStorage,
        );

        expect(storedUrls).toEqual(["https://example.com/article"]);
        expect(response.status).toBe(203);
        expect(await response.text()).toBe("test-key");
    });

    test("it returns a 404 when the url is not found", async () => {
        const urlStorage: MockUrlStorage = {
            getUrl: () => Effect.fail(new UrlNotFoundError()),
        }

        const res = await runFetchHandler(new Request("https://short.example/123e4567-e89b-42d3-a456-426614174000", {
            method: "GET"
        }), urlStorage)

        expect(res.status).toBe(404)

    })

    test("it returns a 400 a key is not included in the url", async () => {
        const urlStorage: MockUrlStorage = {
            getUrl: () => Effect.fail(new UrlNotFoundError()),
        }

        const res = await runFetchHandler(new Request("https://short.example/", {
            method: "GET"
        }), urlStorage)

        expect(res.status).toBe(400)

    })
});
