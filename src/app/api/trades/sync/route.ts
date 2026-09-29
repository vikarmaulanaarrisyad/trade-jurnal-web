import { NextRequest, NextResponse } from 'next/server';
import { syncFromMetaTrader } from '@/lib/serverStore';
import { SyncPayload } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get('x-api-key') || req.headers.get('authorization')?.replace('Bearer ', '');

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing x-api-key header. Sertakan API Key Anda.' },
        { status: 401 }
      );
    }

    const payload: SyncPayload = await req.json();

    if (!payload.account || !payload.account.accountNumber) {
      return NextResponse.json(
        { error: 'Payload tidak valid: objek account dan accountNumber diperlukan.' },
        { status: 400 }
      );
    }

    const result = await syncFromMetaTrader(payload, apiKey);

    return NextResponse.json({
      success: true,
      message: `Berhasil sinkronisasi ${result.totalTradesSynced} transaksi untuk akun #${payload.account.accountNumber}`,
      syncedAt: result.timestamp,
    });
  } catch (error) {
    console.error('Error in /api/trades/sync:', error);
    return NextResponse.json(
      { error: 'Internal Server Error saat memproses sync', details: String(error) },
      { status: 500 }
    );
  }
}

// Support GET for testing if endpoint is reachable from browser or MT4
export async function GET() {
  return NextResponse.json({
    status: 'online',
    endpoint: '/api/trades/sync',
    method: 'POST',
    message: 'MT4/MT5 WebRequest webhook endpoint aktif. Kirimkan JSON payload dengan header x-api-key.',
  });
}
