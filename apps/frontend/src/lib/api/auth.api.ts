import { apiClient } from '@/lib/api/client';
import type { AuthenticatedUser, LoginFormValues } from '@/lib/schemas/auth.schema';

export const login = async (payload: LoginFormValues): Promise<void> => {
  await apiClient.post('/api/auth/login', payload);
};

export const logout = async (): Promise<void> => {
  await apiClient.post('/api/auth/logout');
};

export const fetchCurrentUser = async (): Promise<AuthenticatedUser> => {
  const { data } = await apiClient.get<AuthenticatedUser>('/api/auth/me');
  return data;
};
