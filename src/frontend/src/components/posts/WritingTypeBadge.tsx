import { Badge } from '@/components/ui/badge';
import { WritingType } from '../../backend';
import { BookOpen, Feather } from 'lucide-react';

interface WritingTypeBadgeProps {
  type: WritingType;
}

export default function WritingTypeBadge({ type }: WritingTypeBadgeProps) {
  const isPoetry = type === WritingType.poetry;

  return (
    <Badge variant={isPoetry ? 'default' : 'secondary'} className="gap-1.5">
      {isPoetry ? <Feather className="h-3 w-3" /> : <BookOpen className="h-3 w-3" />}
      {isPoetry ? 'Poetry' : 'Prose'}
    </Badge>
  );
}
