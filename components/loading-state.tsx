import { LoaderCircle } from "lucide-react";

export function LoadingState({ text }: { text: string }) {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
        <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
        <span>{text}</span>
      </div>
    </main>
  );
}
