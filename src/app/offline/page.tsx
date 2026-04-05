export default function OfflinePage() {
  return (
    <main className="min-h-dvh flex items-center justify-center px-6 py-12">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-foreground">You are offline</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Finly could not reach the internet. Please check your connection and try again.
        </p>
      </section>
    </main>
  );
}
