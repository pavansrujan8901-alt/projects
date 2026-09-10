import { NextResponse } from 'next/server';
import { db } from '@/lib/mock-db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { access_code } = body;

    if (!access_code) {
      return NextResponse.json(
        { success: false, error: 'Access code is required' },
        { status: 400 }
      );
    }

    const cleanCode = access_code.toString().trim();
    const patient = db.getPatientByAccessCode(cleanCode);

    if (!patient) {
      return NextResponse.json(
        { success: false, error: 'Invalid 6-digit access code. Please check with your caregiver.' },
        { status: 401 }
      );
    }

    const session = db.createPatientSessionToken(patient.id, patient.access_code);

    return NextResponse.json({
      success: true,
      data: {
        patient,
        token: session.token
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Login failed' },
      { status: 500 }
    );
  }
}
