import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet, useNavigate } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { useEffect } from 'react';
import AppLayout from './components/layout/AppLayout';
import FeedPage from './pages/FeedPage';
import PostDetailPage from './pages/PostDetailPage';
import NewPostPage from './pages/NewPostPage';
import PricingPage from './pages/PricingPage';

function RootComponent() {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle redirect from 404.html for direct navigation/refresh
    const redirectPath = sessionStorage.getItem('redirectPath');
    if (redirectPath) {
      sessionStorage.removeItem('redirectPath');
      // Navigate to the stored path
      navigate({ to: redirectPath as any }).catch((err) => {
        console.error('Navigation error:', err);
        // Fallback to home if navigation fails
        navigate({ to: '/' });
      });
    }
  }, [navigate]);

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

const rootRoute = createRootRoute({
  component: RootComponent,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: FeedPage,
});

const postDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/post/$postId',
  component: PostDetailPage,
});

const newPostRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/new',
  component: NewPostPage,
});

const pricingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pricing',
  component: PricingPage,
});

const routeTree = rootRoute.addChildren([indexRoute, postDetailRoute, newPostRoute, pricingRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
