# URL Shortener Notes

## Integration Test Notes

- Add a small integration test suite that exercises the real Worker request flow instead of mocking the URL store.
- Keep the suite brief and focused on the system wiring.
- Main happy-path test:
  - `POST /` with a JSON body containing a URL;
  - read the generated key from the response body;
  - `GET /:key` using that returned key;
  - assert the response redirects to the original URL.
- Unhappy-path integration tests:
  - invalid UUID: `GET /not-a-uuid` should return `400`;
  - missing UUID: `GET /` should return `400`.
- Leave detailed edge cases to the unit tests.

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
