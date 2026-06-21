import { z } from 'zod';

export const loginFormSchema = z.object({
  username: z
    .string()
    .min(1, "Le nom d'utilisateur est obligatoire")
    .max(100, "Le nom d'utilisateur ne doit pas dépasser 100 caractères"),
  password: z
    .string()
    .min(1, 'Le mot de passe est obligatoire')
    .max(200, 'Le mot de passe ne doit pas dépasser 200 caractères'),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export interface AuthenticatedUser {
  username: string;
  displayName: string;
}
