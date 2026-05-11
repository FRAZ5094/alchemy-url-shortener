function App() {
  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground">
      <section className="mx-auto flex max-w-3xl flex-col gap-8">
        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-wider text-primary">
            URL shortener
          </p>
          <h1 className="text-4xl font-semibold tracking-normal sm:text-6xl">
            React, Vite, and Tailwind are ready.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-muted">
            This frontend lives in its own Vite project so it can later be
            deployed separately from the Worker backend with Alchemy.
          </p>
        </div>

        <div className="grid gap-3 rounded-lg border border-border bg-surface/70 p-5 text-sm text-muted">
          <p>
            Frontend source: <code className="text-primary-muted">web/src</code>
          </p>
          <p>
            Local dev:{" "}
            <code className="text-primary-muted">bun run dev:web</code>
          </p>
          <p>
            Production build:{" "}
            <code className="text-primary-muted">bun run build:web</code>
          </p>
        </div>
      </section>
    </main>
  );
}

export default App;
