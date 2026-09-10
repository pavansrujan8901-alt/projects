import { NextResponse } from 'next/server';
import { getAdaptiveRecommendation } from '@/lib/ai/generator';
import { db } from '@/lib/mock-db';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await params;
    const patient = db.getPatientById(patientId) || db.patients[0];

    const sessions = db.getSessionsByPatient(patient.id);
    const recommendation = getAdaptiveRecommendation(patient, sessions);

    return NextResponse.json({
      success: true,
      data: recommendation
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to get adaptive recommendations' },
      { status: 500 }
    );
  }
}
