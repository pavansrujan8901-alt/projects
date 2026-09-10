import { NextResponse } from 'next/server';
import { db } from '@/lib/mock-db';

export async function POST(
  req: Request,
  _context: { params: Promise<{ patientId: string }> }
) {
  try {
    const body = await req.json();
    const { session_id, question_data, patient_answer, is_correct, response_time_ms, attempts_count } = body;

    if (!session_id) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const recorded = db.logResponse({
      session_id,
      question_data: question_data || {},
      patient_answer: String(patient_answer || ''),
      is_correct: Boolean(is_correct),
      response_time_ms: Number(response_time_ms) || 2000,
      attempts_count: Number(attempts_count) || 1
    });

    return NextResponse.json({
      success: true,
      data: recorded
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to log response' },
      { status: 500 }
    );
  }
}
