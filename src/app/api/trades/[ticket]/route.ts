import { NextRequest, NextResponse } from 'next/server';
import { updateTradeJournal } from '@/lib/serverStore';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ ticket: string }> }
) {
  try {
    const { ticket } = await params;
    const ticketNum = parseInt(ticket, 10);
    if (isNaN(ticketNum)) {
      return NextResponse.json({ error: 'Ticket number tidak valid' }, { status: 400 });
    }

    const body = await req.json();
    const result = await updateTradeJournal(ticketNum, body);

    return NextResponse.json({
      success: true,
      message: `Journal untuk tiket #${ticketNum} berhasil diperbarui`,
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal memperbarui journal trade', details: String(error) },
      { status: 500 }
    );
  }
}
