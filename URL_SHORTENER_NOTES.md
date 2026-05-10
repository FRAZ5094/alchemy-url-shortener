# URL Shortener Notes

## Key Parsing And Schema Notes

- Add schema validation for the key passed to the `GET` route.
- The schema should confirm the key has the expected shape before trying to fetch from KV.
- The validation function should make it clear whether the key is valid or invalid, without mixing that concern into the route handler.
- If the key is intended to be a full value from `crypto.randomUUID()`, validate it as a UUID.
- If the key is only a shortened slice of a UUID, it is not itself a valid UUID. In that case, validate the slice length and allowed characters instead of calling it UUID validation.

## UUID Constraints To Remember

For a normal UUID string produced by `crypto.randomUUID()`:

- Total length is 36 characters.
- Format is five groups separated by hyphens:
  - 8 hex characters
  - 4 hex characters
  - 4 hex characters
  - 4 hex characters
  - 12 hex characters
- That means 32 hexadecimal characters plus 4 hyphens.
- Allowed hex characters are `0-9`, `a-f`, and `A-F`.
- `crypto.randomUUID()` produces a version 4 UUID.
- For a version 4 UUID:
  - the first character of the third group should be `4`;
  - the first character of the fourth group should be one of `8`, `9`, `a`, `A`, `b`, or `B`.
- Example shape only: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`, where `x` is a hex character and `y` is one of the valid variant characters above.

Schema requirements for a full `crypto.randomUUID()` key:

- Must be a string.
- Must be exactly 36 characters.
- Must match the UUID group and hyphen positions.
- Must only contain hex characters and hyphens in the expected positions.
- Must have the version 4 marker.
- Must have a valid UUID variant marker.

## Unit Test Notes

- Add unit tests around the service and route behaviour.
- Mock the URL store so tests do not need a real KV binding.
- For `POST`:
  - test that a valid URL calls the store method that writes the URL to KV;
  - test that the generated key is returned in the response;
  - test invalid input does not call the store.
- For `GET`:
  - test that a valid key calls the store method that reads one URL from KV;
  - test that a stored URL produces the redirect or response expected by the route;
  - test that an invalid key does not call the store;
  - test the missing-key or not-found behaviour.
- Keep the tests focused on behaviour:
  - route/service calls store with the right values;
  - schema accepts valid keys;
  - schema rejects invalid keys.

## Later App Work

- Create an Effect app in the repo in the way Alchemy expects it to be run.
- Use the app to call the Cloudflare Worker for URL shortening.
- Add a simple frontend for submitting long URLs and showing shortened URLs.
- Install and configure Tailwind for styling.
- Keep the app polished enough to use as a real small tool.
- Use this work as a way to learn more about Alchemy run and Effect.

## Later Deployment Work

- Deploy the Worker and frontend to Cloudflare.
- Make the deployment flow work through Alchemy run.
- Confirm the deployed app can:
  - submit a URL;
  - create a key;
  - store the URL in KV;
  - resolve the key back to the original URL;
  - handle invalid or missing keys cleanly.
