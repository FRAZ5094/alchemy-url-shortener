import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";

const apiUrl = "/api";

const shortenUrl = async (url: string) => {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    throw new Error("Unable to shorten that URL.");
  }

  return response.text();
};

const useShortenUrl = () => useMutation({ mutationFn: shortenUrl });

function App() {
  const { mutate, isPending, data, error } = useShortenUrl();
  const [inputUrl, setInputUrl] = useState("");
  const [hasCopied, setHasCopied] = useState(false);

  const handleShortenUrl = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasCopied(false);
    mutate(inputUrl);
  };

  const shortenedUrl = useMemo(() => {
    if (!data) {
      return undefined;
    }

    return `${window.location.origin}/${data}`;
  }, [data]);

  const handleCopyUrl = async () => {
    if (!shortenedUrl) {
      return;
    }

    await navigator.clipboard.writeText(shortenedUrl);
    setHasCopied(true);
  };

  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-2xl flex-col justify-center">
        <div className="mb-8 text-center sm:mb-10">
          <h1 className="text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
            URL Shortener
          </h1>
          <p className="mx-auto mt-3 max-w-md text-base leading-7 text-muted">
            Turn long links into clean, shareable URLs.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-surface shadow-2xl shadow-black/15">
          <div className="border-b border-border px-5 py-5 sm:px-6">
            <h2 className="text-2xl font-semibold tracking-normal text-foreground sm:text-3xl">
              Create a short link
            </h2>
          </div>

          <form onSubmit={handleShortenUrl} className="space-y-5 p-5 sm:p-6">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-muted">
                Destination URL
              </span>
              <input
                type="url"
                placeholder="https://example.com/really-long-url"
                value={inputUrl}
                onChange={(event) => {
                  setInputUrl(event.target.value);
                  setHasCopied(false);
                }}
                className="min-h-12 w-full rounded-md border border-border bg-background px-4 text-base text-foreground outline-none transition placeholder:text-muted/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
              />
            </label>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="submit"
                className="min-h-11 rounded-md bg-primary px-5 text-sm font-semibold text-background transition hover:bg-primary-muted disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                disabled={isPending || !inputUrl}
              >
                {isPending ? "Shortening..." : "Shorten URL"}
              </button>

              {error && (
                <p className="text-sm text-red-200" role="alert">
                  {error.message}
                </p>
              )}
            </div>
          </form>

          {shortenedUrl && (
            <section
              className="border-t border-border bg-background/45 px-5 py-5 sm:px-6"
              aria-live="polite"
            >
              <p className="text-sm font-medium text-muted">Short URL</p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-stretch">
                <a
                  href={shortenedUrl}
                  className="min-w-0 flex-1 rounded-md border border-primary/20 bg-surface-muted px-4 py-3 text-xl font-semibold text-foreground transition hover:border-primary/50 hover:text-primary sm:text-2xl"
                >
                  <span className="block overflow-hidden text-ellipsis whitespace-nowrap">
                    {shortenedUrl}
                  </span>
                </a>
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="min-h-12 rounded-md border border-primary/40 px-5 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary hover:text-background"
                >
                  {hasCopied ? "Copied" : "Copy URL"}
                </button>
              </div>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}

export default App;
