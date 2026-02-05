import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetPost } from '../hooks/useQueries';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import WritingTypeBadge from '../components/posts/WritingTypeBadge';
import PostVisibilityBadge from '../components/posts/PostVisibilityBadge';
import ImageZoomViewer from '../components/posts/ImageZoomViewer';
import { formatAuthor, formatDate } from '../lib/postPresentation';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function PostDetailPage() {
  const { postId } = useParams({ from: '/post/$postId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: post, isLoading, error } = useGetPost(postId);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isAccessDenied = errorMessage.includes('Access denied') || errorMessage.includes('Private post');

    return (
      <div className="text-center py-20">
        <Button onClick={() => navigate({ to: '/' })} variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Feed
        </Button>
        {isAccessDenied ? (
          <Alert variant="destructive" className="max-w-md mx-auto">
            <AlertDescription className="text-center">
              <h2 className="text-xl font-serif font-semibold mb-2">Access Denied</h2>
              <p>This post is private and can only be viewed by its author.</p>
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <h2 className="text-2xl font-serif font-semibold mb-2">Post not found</h2>
            <p className="text-muted-foreground mb-6">The post you're looking for doesn't exist.</p>
          </>
        )}
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-serif font-semibold mb-2">Post not found</h2>
        <p className="text-muted-foreground mb-6">The post you're looking for doesn't exist.</p>
        <Button onClick={() => navigate({ to: '/' })} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Feed
        </Button>
      </div>
    );
  }

  const imageUrl = post.image.getDirectURL();
  const isAuthor = identity && post.author.toString() === identity.getPrincipal().toString();

  return (
    <div className="w-full">
      <Button onClick={() => navigate({ to: '/' })} variant="ghost" className="mb-6 -ml-2">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Feed
      </Button>

      <article className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <WritingTypeBadge type={post.writingType} />
            {isAuthor && <PostVisibilityBadge visibility={post.visibility} />}
            <span className="text-sm text-muted-foreground">
              by {formatAuthor(post.author)} · {formatDate(post.id)}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            {post.title}
          </h1>
          {post.message && (
            <p className="text-lg text-muted-foreground italic border-l-4 border-primary/30 pl-4">
              "{post.message}"
            </p>
          )}
        </header>

        <div
          className="manuscript-frame cursor-zoom-in"
          onClick={() => setIsZoomOpen(true)}
        >
          <img
            src={imageUrl}
            alt={post.title}
            className="w-full h-auto"
            loading="lazy"
          />
        </div>

        <p className="text-sm text-muted-foreground text-center mt-4">
          Click image to zoom and view details
        </p>
      </article>

      <ImageZoomViewer
        imageUrl={imageUrl}
        title={post.title}
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
      />
    </div>
  );
}
