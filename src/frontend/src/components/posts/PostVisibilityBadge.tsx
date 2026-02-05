import { Badge } from '@/components/ui/badge';
import { Lock, Link2 } from 'lucide-react';
import { PostVisibility } from '../../backend';

interface PostVisibilityBadgeProps {
  visibility: PostVisibility;
}

export default function PostVisibilityBadge({ visibility }: PostVisibilityBadgeProps) {
  if (visibility === PostVisibility.publicPost) {
    return null;
  }

  if (visibility === PostVisibility.privatePost) {
    return (
      <Badge variant="secondary" className="gap-1">
        <Lock className="h-3 w-3" />
        Private
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-1">
      <Link2 className="h-3 w-3" />
      Link-only
    </Badge>
  );
}
