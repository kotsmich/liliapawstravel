export type AdminRole = 'admin' | 'operator';

export interface AdminUser {
  id: string;
  email: string;
  role: AdminRole;
}
