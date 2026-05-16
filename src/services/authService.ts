import { supabase } from '../lib/supabaseClient';
import { User, UserRole } from '../types';
import { STORAGE_KEYS } from '../utils/storageKeys';

interface LoginParams {
  identifier: string;
  password: string;
  role: UserRole;
}

interface SupabaseUserRow {
  user_id: number;
  auth_user_id: string | null;
  username: string;
  email: string;
  role: UserRole;
  password: string | null;
}

export function getCurrentUser(): User | null {
  const userData = localStorage.getItem(STORAGE_KEYS.currentUser);
  return userData ? JSON.parse(userData) : null;
}

export function saveCurrentUser(user: User): void {
  localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user));
}

export function clearCurrentUser(): void {
  localStorage.removeItem(STORAGE_KEYS.currentUser);
}

export async function loginWithCredentials({ identifier, password, role }: LoginParams): Promise<User> {
  const loginIdentifier = identifier.trim();
  const loginPassword = password;

  if (!loginIdentifier || !loginPassword.trim()) {
    throw new Error('Please enter both your email/username and password.');
  }

  const storedProfile = await getUserForIdentifier(loginIdentifier);

  if (storedProfile?.password && storedProfile.password === loginPassword) {
    return completeLogin(storedProfile, role);
  }

  const loginEmail = storedProfile?.email || (loginIdentifier.includes('@')
    ? loginIdentifier
    : await getEmailForUsername(loginIdentifier));

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: loginEmail,
    password: loginPassword,
  });

  if (authError) {
    throw new Error('Invalid login credentials');
  }

  if (!authData.user) {
    throw new Error('User not found.');
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('user_id, auth_user_id, username, email, role, password')
    .eq('auth_user_id', authData.user.id)
    .limit(1)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  const linkedProfile = (profile || storedProfile) as SupabaseUserRow | null;

  if (!linkedProfile) {
    throw new Error('Login succeeded, but no matching user profile was found.');
  }

  if (!linkedProfile.auth_user_id) {
    await supabase
      .from('users')
      .update({ auth_user_id: authData.user.id })
      .eq('user_id', linkedProfile.user_id);
  }

  return completeLogin(linkedProfile, role);
}

function completeLogin(user: SupabaseUserRow, role: UserRole): User {
  if (user.role !== role) {
    throw new Error('Invalid role selection for this user.');
  }

  const sessionUser: User = {
    id: user.user_id.toString(),
    name: user.username || user.email,
    email: user.email,
    role: user.role,
  };

  saveCurrentUser(sessionUser);
  return sessionUser;
}

export async function sendPasswordResetEmail(email: string): Promise<void> {
  const resetEmail = email.trim();

  if (!resetEmail || !resetEmail.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }

const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
redirectTo: `https://vincenttamano.github.io/JT-Inventory/#/reset-password`,
});

  if (error) {
    throw error;
  }
}

export async function updatePassword(newPassword: string): Promise<void> {
  const password = newPassword.trim();

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    throw error;
  }
}

async function getEmailForUsername(username: string): Promise<string> {
  const data = await getUserForIdentifier(username);

  if (!data?.email) {
    throw new Error('User not found.');
  }

  return data.email;
}

async function getUserForIdentifier(identifier: string): Promise<SupabaseUserRow | null> {
  const column = identifier.includes('@') ? 'email' : 'username';
  const { data, error } = await supabase
    .from('users')
    .select('user_id, auth_user_id, username, email, role, password')
    .ilike(column, identifier)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as SupabaseUserRow | null) || null;
}
