'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/components/auth/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { loginFormSchema, type LoginFormValues } from '@/lib/schemas/auth.schema';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { username: '', password: '' },
  });

  // Supprime les identifiants de l'URL s'ils y figurent (soumission GET native).
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/');
    }
  }, [isLoading, isAuthenticated, router]);

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values);
      router.replace('/');
    } catch {
      toast({
        variant: 'destructive',
        title: 'Échec de la connexion',
        description: 'Identifiants invalides',
      });
      form.setValue('password', '');
    }
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void form.handleSubmit(onSubmit)(event);
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background bg-halo px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(50rem_30rem_at_50%_-10%,black,transparent)]" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <BrandLogo priority />
        </div>
        <Card className="overflow-hidden">
          <div className="h-1.5 w-full bg-brand-gradient" />
          <CardHeader className="text-center">
            <CardTitle>Connexion</CardTitle>
            <CardDescription>
              Connectez-vous avec votre compte d&apos;entreprise.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                method="post"
                noValidate
                onSubmit={handleFormSubmit}
                className="space-y-5"
              >
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom d&apos;utilisateur</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="prenom.nom"
                          autoComplete="username"
                          autoFocus
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mot de passe</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            className="pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                            aria-label={
                              showPassword
                                ? 'Masquer le mot de passe'
                                : 'Afficher le mot de passe'
                            }
                            tabIndex={-1}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connexion en cours...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Se connecter
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
