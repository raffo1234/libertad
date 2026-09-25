export default function RoleBadge({ role }: { role: string | null | undefined }) {
  if (!role) return null;

  return (
    <span className="font-mulish inline-flex items-center rounded-full bg-[#f0ede8] px-2.5 py-1 text-[10px] tracking-wider text-[#6b665e] uppercase">
      {role}
    </span>
  );
}
