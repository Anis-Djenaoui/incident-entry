'use client';

import { useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/auth-provider';

export function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 rounded-full border border-border/70 bg-background/80 px-3 py-1.5 shadow-sm backdrop-blur">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
        <User className="h-4 w-4" />
      </span>
      <span className="max-w-[10rem] truncate text-sm font-medium text-foreground">
        {user.displayName}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        className="h-7 gap-1.5 px-2 text-muted-foreground hover:text-foreground"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Déconnexion</span>
      </Button>
    </div>
  );
}
