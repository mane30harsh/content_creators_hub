import { cn } from "@/lib/utils";

interface AuthCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  /** Shown above the title — icon or logo area */
  icon?: React.ReactNode;
}

export function AuthCard({ title, description, children, className, icon }: AuthCardProps) {
  return (
    <div
      className={cn(
        "w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm",
        className
      )}
    >
      {icon && <div className="mb-6 flex justify-center">{icon}</div>}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}
