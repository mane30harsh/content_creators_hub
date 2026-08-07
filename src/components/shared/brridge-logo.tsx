export function BrridgeLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 font-bold tracking-tight ${className}`}>
      <div className="grid grid-cols-2 gap-0.5 w-5 h-5 shrink-0">
        <span className="w-2 h-2 rounded-[2px] bg-[#E60067]" />
        <span className="w-2 h-2 rounded-[2px] bg-[#EAB308]" />
        <span className="w-2 h-2 rounded-[2px] bg-[#E60067]" />
        <span className="w-2 h-2 rounded-[2px] bg-[#FF0066]" />
      </div>
      <span className="text-lg tracking-tight font-extrabold text-foreground">Brridge</span>
    </div>
  );
}
