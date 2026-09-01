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
      // Return mock profile for development without Supabase
      return NextResponse.json({
        profile: {
          id: 'local-profile-1',
          user_id: userId,
          profile_type: 'balanced',
          win_rate: 45,
          loss_rate: 55,
          min_profit: 10,
          max_loss: 50,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });
    }

    const response = await fetch(`${SUPABASE_URL}/rest/v1/trading_profiles?user_id=eq.${userId}`, {
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ profile: null });
    }

    const profiles = await response.json();
    const profile = profiles.length > 0 ? profiles[0] : null;

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Failed to fetch trading profile:', error);
    return NextResponse.json({ profile: null });
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
      // Return updated mock profile for development
      return NextResponse.json({
        profile: {
          id: body.id || 'local-profile-1',
          user_id: userId,
          profile_type: body.profileType || 'balanced',
          win_rate: body.winRate || 45,
          loss_rate: body.lossRate || 55,
          min_profit: body.minProfit || 10,
          max_loss: body.maxLoss || 50,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });
    }

    const updateData = {
      profile_type: body.profileType,
      win_rate: body.winRate,
      loss_rate: body.lossRate,
      min_profit: body.minProfit,
      max_loss: body.maxLoss,
      updated_at: new Date().toISOString(),
    };

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/trading_profiles?user_id=eq.${userId}`,
      {
        method: 'PATCH',
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    const updated = await response.json();
    const profile = Array.isArray(updated) ? updated[0] : updated;

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Failed to update trading profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
