import { type WritingPost } from '../../backend';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import WritingTypeBadge from './WritingTypeBadge';
import PostVisibilityBadge from './PostVisibilityBadge';
import { useNavigate } from '@tanstack/react-router';
import { formatAuthor, formatDate } from '../../lib/postPresentation';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';

interface PostCardProps {
  post: WritingPost;
  featured?: boolean;
}

export default function PostCard({ post, featured = false }: PostCardProps) {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const imageUrl = post.image.getDirectURL();

  const isAuthor = identity && post.author.toString() === identity.getPrincipal().toString();

  const handleClick = () => {
    navigate({ to: '/post/$postId', params: { postId: post.id } });
  };

  return (
    <Card
      className={`overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 ${
        featured ? 'gallery-featured' : ''
      }`}
      onClick={handleClick}
    >
      <div className={`${featured ? 'aspect-[3/4]' : 'aspect-[4/3]'} overflow-hidden bg-muted`}>
        <div className="manuscript-frame manuscript-frame-sm h-full">
          <img
            src={imageUrl}
            alt={post.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <WritingTypeBadge type={post.writingType} />
          {isAuthor && <PostVisibilityBadge visibility={post.visibility} />}
        </div>
        <h3 className="text-xl font-serif font-semibold line-clamp-2">{post.title}</h3>
      </CardHeader>
      {post.message && (
        <CardContent className="pt-0 pb-3">
          <p className="text-sm text-muted-foreground italic line-clamp-2">"{post.message}"</p>
        </CardContent>
      )}
      <CardFooter className="text-xs text-muted-foreground pt-0">
        <span>
          by {formatAuthor(post.author)} · {formatDate(post.id)}
        </span>
      </CardFooter>
    </Card>
  );
}
