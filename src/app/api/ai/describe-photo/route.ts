import { NextResponse } from 'next/server';
import { suggestPhotoDescription } from '@/lib/ai/generator';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { category, existing_notes, patient_name } = body;

    const suggestion = suggestPhotoDescription({
      category: category || 'family',
      existingNotes: existing_notes,
      patientName: patient_name
    });

    return NextResponse.json({
      success: true,
      data: suggestion
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to suggest description' },
      { status: 500 }
    );
  }
}
