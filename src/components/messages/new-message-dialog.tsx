"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { searchUsers } from "@/lib/actions/message";

interface UserResult {
  id: string;
  name: string | null;
  role: string;
  image: string | null;
  username?: string;
}

export function NewMessageDialog() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [isPending, startTransition] = useTransition();
  const [searched, setSearched] = useState(false);
  const router = useRouter();

  async function handleSearch() {
    if (!search.trim()) return;
    setSearched(true);
    startTransition(async () => {
      const users = await searchUsers(search.trim());
      setResults(users);
    });
  }

  function selectUser(userId: string) {
    setOpen(false);
    setSearch("");
    setResults([]);
    setSearched(false);
    router.push(`/messages/new?userId=${userId}`);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <MessageSquare className="mr-1.5 h-4 w-4" />
          New Message
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Search users by name or username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button size="sm" onClick={handleSearch} disabled={isPending || !search.trim()}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {searched && results.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">No users found.</p>
          )}

          <div className="max-h-60 space-y-1 overflow-y-auto">
            {results.map((user) => (
              <button
                key={user.id}
                onClick={() => selectUser(user.id)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                  {user.name?.[0] ?? "?"}
                </div>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user.role.toLowerCase()}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
