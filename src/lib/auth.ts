import crypto from 'crypto';
import db from '@/lib/db';
import { apiKeys } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

export async function hashKey(key: string) {
  return crypto.createHash('sha256').update(key).digest('hex');
}

export async function validateApiKey(rawKey: string) {
  const keyHash = await hashKey(rawKey);

  const keyRow = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.keyHash, keyHash))
    .get();
  if (!keyRow) return null;

  // update lastUsed
  await db
    .update(apiKeys)
    .set({ lastUsed: new Date() })
    .where(eq(apiKeys.id, keyRow.id));

  return keyRow.userId;
}

export async function getAuthUser(req: Request) {
  // 1. API key header
  const apiKey = req.headers.get('x-api-key');
  if (apiKey) {
    const uid = await validateApiKey(apiKey);
    if (uid) return { id: uid };
  }
  // 2. next-auth session
  const session = await getServerSession(authOptions);
  if (session?.user && 'id' in session.user)
    return { id: Number(session.user.id) };

  return null;
}

export async function generateApiKey() {
  return crypto.randomBytes(32).toString('hex');
}
