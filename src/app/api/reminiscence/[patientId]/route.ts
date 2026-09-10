import { NextResponse } from 'next/server';
import { db } from '@/lib/mock-db';
import { generateLocalTrivia } from '@/lib/ai/prompts';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await params;
    const { searchParams } = new URL(req.url);
    const lang = searchParams.get('lang') || 'en';

    const patient = db.getPatientById(patientId) || db.patients[0];
    let questions = db.getTriviaForPatient(patient.id, lang);

    if (questions.length === 0) {
      // Generate dynamically
      const generated = generateLocalTrivia(
        patient.id,
        patient.hometown,
        patient.birth_year,
        lang
      );
      db.trivia.push(generated);
      questions = [generated];
    }

    return NextResponse.json({
      success: true,
      data: questions
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch reminiscence content' },
      { status: 500 }
    );
  }
}
