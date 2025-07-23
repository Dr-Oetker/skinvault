import { supabase } from '../supabaseClient';

// Admin email addresses that have admin privileges
const ADMIN_EMAILS = [
  'admin@skinvault.app',
  'lenlenkl@gmail.com'
];

/**
 * Check if the current user is an admin
 * @param user - The current user object from auth store
 * @returns boolean indicating if user is admin
 */
export const isAdmin = (user: any): boolean => {
  if (!user || !user.email) return false;
  return ADMIN_EMAILS.includes(user.email.toLowerCase());
};

/**
 * Get admin status for the current user
 * @returns Promise<boolean> indicating if current user is admin
 */
export const getAdminStatus = async (): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  return isAdmin(user);
};

/**
 * Require admin access - throws error if user is not admin
 * @param user - The current user object
 * @throws Error if user is not admin
 */
export const requireAdmin = (user: any): void => {
  if (!isAdmin(user)) {
    throw new Error('Admin access required');
  }
}; 