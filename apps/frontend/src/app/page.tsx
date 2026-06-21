import { BrandLogo } from '@/components/brand-logo';
import { DossierForm } from '@/components/dossier-form';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { UserMenu } from '@/components/auth/user-menu';

export default function HomePage() {
  return (
    <ProtectedRoute>
      <main className="relative min-h-screen overflow-hidden bg-background bg-halo">
        <div className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(60rem_40rem_at_50%_-10%,black,transparent)]" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-8 sm:px-6 sm:py-14">
          <div className="mb-4 flex w-full justify-end">
            <UserMenu />
          </div>
          <header className="mb-6 flex w-full max-w-4xl flex-col items-center gap-3 text-center sm:mb-10">
            <div className="rounded-2xl bg-transparent px-6 py-2">
              <BrandLogo priority />
            </div>
          </header>
          <DossierForm />
        </div>
      </main>
    </ProtectedRoute>
  );
}
