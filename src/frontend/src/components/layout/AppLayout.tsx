import { type ReactNode } from 'react';
import AppHeader from './AppHeader';
import ProfileSetupModal from '../profile/ProfileSetupModal';
import OfflineNotice from '../pwa/OfflineNotice';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background paper-texture">
      <AppHeader />
      <OfflineNotice />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {children}
      </main>
      <footer className="border-t mt-20 py-8 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            © 2026. Built with ❤️ using{' '}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
      <ProfileSetupModal />
    </div>
  );
}
