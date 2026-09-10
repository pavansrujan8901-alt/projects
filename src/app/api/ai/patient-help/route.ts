import { NextResponse } from 'next/server';
import { answerPatientHelp } from '@/lib/ai/generator';
import { db } from '@/lib/mock-db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query, current_screen, patient_id, language } = body;

    const patient = patient_id ? db.getPatientById(patient_id) : undefined;

    const response = answerPatientHelp({
      query: query || 'help',
      currentScreen: current_screen || 'home',
      patientName: patient?.name || 'friend',
      language: language || 'en'
    });

    return NextResponse.json({
      success: true,
      data: response
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to process help query' },
      { status: 500 }
    );
  }
}
