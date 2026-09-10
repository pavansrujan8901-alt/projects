import { NextResponse } from 'next/server';
import { db } from '@/lib/mock-db';
import { GameType } from '@/types/database';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await params;
    const sessions = db.getSessionsByPatient(patientId);

    return NextResponse.json({
      success: true,
      data: sessions
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await params;
    const body = await req.json();
    const { action, game_type, difficulty_level, session_id, score, max_score } = body;

    if (action === 'complete') {
      let completedSession = session_id ? db.completeSession(session_id, score ?? 100, max_score ?? 100) : undefined;
      
      // Fallback: If session_id wasn't found or passed, complete the patient's latest active session
      if (!completedSession) {
        const patientSessions = db.getSessionsByPatient(patientId);
        const openSession = patientSessions.slice().reverse().find(s => !s.completed && (!game_type || s.game_type === game_type));
        if (openSession) {
          completedSession = db.completeSession(openSession.id, score ?? 100, max_score ?? 100);
        } else {
          // If no open session exists, start and immediately complete one so telemetry is recorded
          const fresh = db.startSession(patientId, (game_type as GameType) || 'memory_match', difficulty_level || 1);
          completedSession = db.completeSession(fresh.id, score ?? 100, max_score ?? 100);
        }
      }

      return NextResponse.json({
        success: true,
        data: completedSession
      });
    }

    // Default action: start new session
    const session = db.startSession(
      patientId,
      (game_type as GameType) || 'memory_match',
      difficulty_level || 1
    );

    return NextResponse.json({
      success: true,
      data: session
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to manage session' },
      { status: 500 }
    );
  }
}
