import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight">Content Creators Hub</h1>
      <p className="max-w-md text-muted-foreground">
        The foundation is up and running. Build creator and brand
        collaboration features on top of this scaffold.
      </p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/login">Log in</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/register">Create account</Link>
        </Button>
      </div>
    </main>
  );
}
