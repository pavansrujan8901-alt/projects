import { NextResponse } from 'next/server';
import { answerCaregiverQuery } from '@/lib/ai/generator';
import { db } from '@/lib/mock-db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query, patient_id } = body;

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query is required' },
        { status: 400 }
      );
    }

    const patient = (patient_id ? db.getPatientById(patient_id) : null) || db.patients[0];
    if (!patient) {
      return NextResponse.json(
        { success: false, error: 'Patient not found' },
        { status: 404 }
      );
    }

    const sessions = db.getSessionsByPatient(patient.id);
    const photos = db.getPhotosByPatient(patient.id);

    const answer = answerCaregiverQuery({
      query,
      patient,
      sessions,
      photos
    });

    return NextResponse.json({
      success: true,
      data: answer
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to answer caregiver query' },
      { status: 500 }
    );
  }
}
