import { NextResponse } from 'next/server';
import { db } from '@/lib/mock-db';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await params;
    const patient = db.getPatientById(patientId) || db.patients[0];
    const sessions = db.getSessionsByPatient(patient.id);
    const insights = db.getInsightsByPatient(patient.id);

    const report = {
      patient,
      generatedDate: new Date().toLocaleDateString('en-US', { dateStyle: 'long' }),
      clinician: db.users[0].full_name,
      totalSessions: sessions.length,
      overallAccuracy: 84,
      reactionTimeAverage: '2.4s',
      domains: [
        { name: 'Visual Recognition (Face-Name)', score: 86, status: 'Stable' },
        { name: 'Short-term Recall (Memory Match)', score: 80, status: 'Improving' },
        { name: 'Autobiographical Memory (Reminiscence)', score: 90, status: 'Strong' },
        { name: 'Temporal Orientation (Daily Check-in)', score: 95, status: 'Optimal' }
      ],
      weeklyTrend: [
        { day: 'Mon', score: 68 },
        { day: 'Tue', score: 72 },
        { day: 'Wed', score: 75 },
        { day: 'Thu', score: 82 },
        { day: 'Fri', score: 85 },
        { day: 'Sat', score: 88 },
        { day: 'Sun', score: 84 }
      ],
      recentInsights: insights.map(i => i.insight_text),
      recommendations: [
        'Continue daily 10-15 minute interactive sessions during morning alertness peak.',
        'Encourage family conversations around 1960s-1970s cultural landmarks to stimulate autobiographical narrative recall.',
        'Maintain high-contrast display settings for visual comfort and reduced cognitive fatigue.'
      ]
    };

    return NextResponse.json({
      success: true,
      data: report
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to generate report' },
      { status: 500 }
    );
  }
}
