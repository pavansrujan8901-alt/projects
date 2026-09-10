import { NextResponse } from 'next/server';
import { db } from '@/lib/mock-db';
import { generateLocalCaregiverInsight } from '@/lib/ai/prompts';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await params;
    const insights = db.getInsightsByPatient(patientId);

    return NextResponse.json({
      success: true,
      data: insights
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch insights' },
      { status: 500 }
    );
  }
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await params;
    const patient = db.getPatientById(patientId) || db.patients[0];
    const sessions = db.getSessionsByPatient(patient.id);

    const avgScore = sessions.length > 0
      ? Math.round(sessions.reduce((acc, s) => acc + s.score, 0) / sessions.length)
      : 82;

    const insightText = generateLocalCaregiverInsight(
      patient.name,
      avgScore,
      sessions.length || 6
    );

    const newInsight = db.addInsight({
      patient_id: patient.id,
      insight_text: insightText,
      category: 'weekly_summary',
      score_delta_pct: 15.2,
      insight_date: new Date().toISOString().split('T')[0]
    });

    return NextResponse.json({
      success: true,
      data: newInsight
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to generate insight' },
      { status: 500 }
    );
  }
}
