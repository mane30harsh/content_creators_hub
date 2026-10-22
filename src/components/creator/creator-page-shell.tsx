import type { ReactNode } from "react";
import { CreatorSidebar } from "./creator-sidebar";
import { CreatorSuggestions } from "./creator-suggestions";
import type { CreatorSuggestionItem } from "@/lib/creator-suggestions";

interface CreatorPageShellProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    username?: string | null;
    avatar?: string | null;
  };
  suggestions: CreatorSuggestionItem[];
  children: ReactNode;
  mainClassName?: string;
}

export function CreatorPageShell({
  user,
  suggestions,
  children,
  mainClassName = "",
}: CreatorPageShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#070709] text-white">
      <CreatorSidebar user={user} />

      <main
        className={`flex-1 border-r border-neutral-900/60 px-6 py-6 ${mainClassName}`}
      >
        {children}
      </main>

      <CreatorSuggestions suggestions={suggestions} />
    </div>
  );
}
