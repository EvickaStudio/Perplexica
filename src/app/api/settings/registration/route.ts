import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import db from '@/lib/db';
import { settings, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: Request) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check if user is admin
    const userRecord = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .get();
    if (!userRecord?.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 },
      );
    }

    const setting = await db.select().from(settings).get();
    return NextResponse.json({
      registrationOpen: setting?.registrationOpen ?? true,
    });
  } catch (error) {
    console.error('Failed to fetch registration status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check if user is admin
    const userRecord = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .get();
    if (!userRecord?.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 },
      );
    }

    const { registrationOpen } = await req.json();

    if (typeof registrationOpen !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid registration status' },
        { status: 400 },
      );
    }

    const existingSetting = await db.select().from(settings).get();

    if (existingSetting) {
      await db
        .update(settings)
        .set({ registrationOpen })
        .where(eq(settings.id, existingSetting.id));
    } else {
      await db.insert(settings).values({ registrationOpen });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update registration status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
