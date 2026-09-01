import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      // Return default language for development without Supabase
      return NextResponse.json({
        preference: {
          id: 'local-lang-1',
          user_id: userId,
          language: 'en',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });
    }

    const response = await fetch(`${SUPABASE_URL}/rest/v1/language_preferences?user_id=eq.${userId}`, {
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return NextResponse.json({ preference: null });
    }

    const preferences = await response.json();
    const preference = preferences.length > 0 ? preferences[0] : null;

    return NextResponse.json({ preference });
  } catch (error) {
    console.error('Failed to fetch language preference:', error);
    return NextResponse.json({ preference: null });
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const body = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      // Return updated mock preference for development
      return NextResponse.json({
        preference: {
          id: 'local-lang-1',
          user_id: userId,
          language: body.language || 'en',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });
    }

    const updateData = {
      language: body.language,
      updated_at: new Date().toISOString(),
    };

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/language_preferences?user_id=eq.${userId}`,
      {
        method: 'PATCH',
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        signal: AbortSignal.timeout(8000),
        body: JSON.stringify(updateData),
      }
    );

    if (!response.ok) {
      // If preference doesn't exist, create it
      const createResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/language_preferences`,
        {
          method: 'POST',
          headers: {
            apikey: SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
          },
          signal: AbortSignal.timeout(8000),
          body: JSON.stringify({
            user_id: userId,
            language: body.language,
          }),
        }
      );

      if (!createResponse.ok) {
        return NextResponse.json({ error: 'Failed to update language preference' }, { status: 500 });
      }

      const createdText = await createResponse.text();
      const created = createdText ? JSON.parse(createdText) : null;
      const preference = Array.isArray(created) ? created[0] : created;
      return NextResponse.json({ preference });
    }

    const updatedText = await response.text();
    const updated = updatedText ? JSON.parse(updatedText) : null;
    const preference = Array.isArray(updated) ? updated[0] : updated;

    if (!preference) {
      const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/language_preferences`, {
        method: 'POST',
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        signal: AbortSignal.timeout(8000),
        body: JSON.stringify({ user_id: userId, language: body.language }),
      });

      if (!createResponse.ok) {
        return NextResponse.json({ error: 'Failed to create language preference' }, { status: 500 });
      }

      const createdText = await createResponse.text();
      const created = createdText ? JSON.parse(createdText) : null;
      return NextResponse.json({ preference: Array.isArray(created) ? created[0] : created });
    }

    return NextResponse.json({ preference });
  } catch (error) {
    console.error('Failed to update language preference:', error);
    return NextResponse.json(
      { error: 'Supabase is temporarily unreachable. Preference was kept locally.', retryable: true },
      { status: 503 }
    );
  }
}
