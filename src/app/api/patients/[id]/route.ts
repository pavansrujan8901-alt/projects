import { NextResponse } from 'next/server';
import { db } from '@/lib/mock-db';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const patient = db.getPatientById(id);

    if (!patient) {
      return NextResponse.json(
        { success: false, error: 'Patient not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: patient
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch patient' },
      { status: 500 }
    );
  }
}
