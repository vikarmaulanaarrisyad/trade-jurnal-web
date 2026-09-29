import { NextResponse } from 'next/server';
import { getAccounts, getAllAccounts, getTrades, getLastPingAgeSeconds } from '@/lib/serverStore';
import { isSupabaseConfigured } from '@/lib/supabase';

export async function GET() {
  try {
    const account = await getAccounts();
    const accounts = await getAllAccounts();
    const trades = await getTrades();
    const lastPingSeconds = getLastPingAgeSeconds();

    return NextResponse.json({
      success: true,
      account,
      accounts,
      trades,
      meta: {
        isSupabaseConnected: isSupabaseConfigured,
        lastPingSeconds,
        isTerminalOnline: lastPingSeconds < 30,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch trades', details: String(error) },
      { status: 500 }
    );
  }
}
