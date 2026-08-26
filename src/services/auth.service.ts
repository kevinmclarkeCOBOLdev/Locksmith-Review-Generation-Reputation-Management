import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { DEFAULT_TENANT_ID } from '@/db/constants';
import { mockUsers } from '@/db/mock';
import type { User } from '@/types/auth';

export { signJWT, verifyJWT } from '@/lib/jwt';

export async function validateUserCredentials(email: string, password: string): Promise<User | null> {
  const normalizedEmail = (email || '').trim().toLowerCase();
  const inputPassword = (password || '').trim();

  if (!normalizedEmail || !inputPassword) {
    return null;
  }

  // 1. Authoritative validation against User record(s) in MySQL
  try {
    const userList = await db
      .select()
      .from(users)
      .where(and(eq(users.email, normalizedEmail), eq(users.password, inputPassword)))
      .limit(1);

    if (userList && userList.length > 0) {
      const u = userList[0];
      return {
        id: u.id,
        tenantId: u.tenantId || DEFAULT_TENANT_ID,
        email: u.email,
        role: 'admin',
      };
    }

    // Check if the users table has records
    const existingUsers = await db.select({ id: users.id }).from(users).limit(1);
    if (existingUsers && existingUsers.length > 0) {
      // User records exist in DB and provided credentials do NOT match -> Reject immediately
      return null;
    }
  } catch (dbErr) {
    console.warn('[AuthService] MySQL query fallback to mock users (DB offline):', dbErr);
  }

  // 2. If MySQL users table is empty or DB offline, strictly validate against configured demo identity
  const cleanPassword = inputPassword.replace(/\s+/g, '');
  const mockUser = mockUsers.find(
    (u) =>
      u.email.toLowerCase() === normalizedEmail &&
      (u.password === inputPassword || u.password === cleanPassword)
  );

  if (mockUser) {
    return {
      id: mockUser.id,
      tenantId: mockUser.tenantId || DEFAULT_TENANT_ID,
      email: mockUser.email,
      role: 'admin',
    };
  }

  // Reject all other emails/passwords
  return null;
}
