import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function LogoutButton() {
  const { logout, user } = useAuth();

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">
        Welcome, {user?.email}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={logout}
        className="flex items-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </Button>
    </div>
  );
}