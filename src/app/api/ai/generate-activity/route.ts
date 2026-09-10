import { NextResponse } from 'next/server';
import { generateActivityFromMemory } from '@/lib/ai/generator';
import { db } from '@/lib/mock-db';

export async function POST(req: Request) {
  try {
    const body = await req.json();

        if (body.action === 'report_problem' && body.report) {
      const { activity_id, patient_id, reason, details } = body.report;
      const report = db.reportActivity({
        activity_id,
        patient_id: patient_id || 'demo-patient-1',
        reason: reason || 'other',
        details: details || ''
      });
      return NextResponse.json({
        success: true,
        message: 'Activity flagged and permanently prevented from reaching patient',
        data: report
      });
    }

if (body.action === 'approve_and_save' && body.activity) {
      const { activity, patient_id } = body;
      const targetPatientId = patient_id || 'demo-patient-1';
      const newTrivia = {
        id: `trivia-ai-${Date.now()}`,
        patient_id: targetPatientId,
        language: activity.language || 'en',
        question: activity.question,
        options: activity.options && activity.options.length === 4 ? activity.options : [
          activity.options?.[0] || 'Correct Memory',
          activity.options?.[1] || 'Familiar Place',
          activity.options?.[2] || 'Favorite Song',
          activity.options?.[3] || 'Morning Garden'
        ],
        correct_answer_index: 0,
        fun_fact: activity.funFact || 'A wonderful family story preserved with love.',
        era_decade: 'Personal Story',
        topic: activity.category || 'family'
      };
      db.trivia.unshift(newTrivia);
      return NextResponse.json({
        success: true,
        message: 'Activity approved and added to patient active deck',
        data: newTrivia
      });
    }

    const { memory_text, category, activity_type, patient_id, language } = body;

    if (!memory_text || typeof memory_text !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Memory text is required' },
        { status: 400 }
      );
    }

    const patient = patient_id ? db.getPatientById(patient_id) : undefined;
    const patientName = patient?.name || 'Anita';

    const activity = await generateActivityFromMemory({
      memoryText: memory_text,
      category: category || 'family',
      activityType: activity_type || 'reminiscence_question',
      patientName,
      language: language || patient?.preferred_language || 'en'
    });

    return NextResponse.json({
      success: true,
      data: activity
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to generate activity' },
      { status: 500 }
    );
  }
}
