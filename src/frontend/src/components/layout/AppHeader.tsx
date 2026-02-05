import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import LoginButton from '../auth/LoginButton';
import AuthStatus from '../auth/AuthStatus';
import InstallAppButton from '../pwa/InstallAppButton';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';

export default function AppHeader() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between max-w-7xl">
        <button
          onClick={() => navigate({ to: '/' })}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <img
            src="/assets/generated/poetry-logo.dim_512x512.png"
            alt="Logo"
            className="h-10 w-10"
          />
          <div className="flex flex-col items-start">
            <span className="font-serif text-xl font-bold">Handwritten</span>
            <span className="text-xs text-muted-foreground -mt-1">Poetry & Prose</span>
          </div>
        </button>

        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate({ to: '/pricing' })}
            className="hidden sm:inline-flex"
          >
            Pricing
          </Button>
          <InstallAppButton />
          {identity && <AuthStatus />}
          <LoginButton />
        </div>
      </div>
    </header>
  );
}
