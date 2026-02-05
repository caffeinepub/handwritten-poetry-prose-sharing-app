import { useEffect } from 'react';
import { useGetAllPosts } from '../hooks/useQueries';
import PostCard from '../components/posts/PostCard';
import { Loader2, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { setSEO } from '../lib/seo';

export default function FeedPage() {
  const { data: posts, isLoading } = useGetAllPosts();
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();

  useEffect(() => {
    setSEO(
      'Handwritten Poetry & Prose - Share Your Writing with the World',
      'Discover and share handwritten poetry and prose. A beautiful collection of handwritten words from writers around the world.'
    );
  }, []);

  const handleNewPost = () => {
    if (!identity) {
      // User will be prompted to login on the new post page
      navigate({ to: '/new' });
    } else {
      navigate({ to: '/new' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const sortedPosts = posts ? [...posts].reverse() : [];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-serif font-bold text-foreground mb-2">Handwritten Words</h1>
          <p className="text-muted-foreground">A collection of poetry and prose, written by hand</p>
        </div>
        <Button onClick={handleNewPost} size="lg" className="gap-2">
          <PenLine className="h-5 w-5" />
          Share Your Writing
        </Button>
      </div>

      {sortedPosts.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <PenLine className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-serif font-semibold mb-2">No posts yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Be the first to share your handwritten poetry or prose with the world.
          </p>
          <Button onClick={handleNewPost} size="lg" className="gap-2">
            <PenLine className="h-5 w-5" />
            Create First Post
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-auto">
          {sortedPosts.map((post, index) => {
            // Make every 5th post (starting from index 4) featured on desktop
            const isFeatured = (index + 1) % 5 === 0;
            return <PostCard key={post.id} post={post} featured={isFeatured} />;
          })}
        </div>
      )}
    </div>
  );
}
