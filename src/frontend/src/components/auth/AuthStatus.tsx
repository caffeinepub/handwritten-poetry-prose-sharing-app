import { useGetCallerUserProfile } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { User } from 'lucide-react';

export default function AuthStatus() {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();

  if (!identity) return null;

  const principal = identity.getPrincipal().toString();
  const shortPrincipal = `${principal.slice(0, 5)}...${principal.slice(-3)}`;

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <User className="h-4 w-4" />
      <span>{userProfile?.name || shortPrincipal}</span>
    </div>
  );
}
