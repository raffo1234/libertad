import { usePermissions } from "../../hooks/usePermissions";

interface RequirePermissionProps {
  permission: string;
  children: React.ReactNode;
}

export default function RequirePermission({ permission, children }: RequirePermissionProps) {
  const { data: permissions } = usePermissions();

  if (permissions === undefined) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#e8e3db] border-t-[#c9a96e]" />
      </div>
    );
  }

  if (!(permissions ?? []).includes(permission)) {
    return (
      <div className="font-manrope flex min-h-[60vh] items-center justify-center p-12 text-sm text-[#9e9890] italic">
        No tienes acceso a esta sección.
      </div>
    );
  }

  return <>{children}</>;
}
