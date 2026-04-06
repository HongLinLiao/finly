import MainLayout from "@/components/util/layout/main-layout";

export default function OfflinePage() {
  return (
    <MainLayout isShowHeader={false}>
      <div className="h-full flex flex-1 items-center justify-center">
        <section className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-foreground">You are offline</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Finly could not reach the internet. Please check your connection and try again.
          </p>
        </section>
      </div>
    </MainLayout>
  );
}
