import { NextResponse } from 'next/server';
import { db } from '@/lib/mock-db';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, context: RouteContext) {
  try {
    const { id: patientId } = await context.params;
    const url = new URL(req.url);
    const includeArchived = url.searchParams.get('include_archived') === 'true';

    const memories = db.getCuratedMemories(patientId, includeArchived);
    return NextResponse.json({
      success: true,
      data: memories
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch memories' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request, context: RouteContext) {
  try {
    const { id: patientId } = await context.params;
    const body = await req.json();

    const { action, memory, memoryId, updates } = body;

    if (action === 'archive' && memoryId) {
      const ok = db.archiveCuratedMemory(memoryId);
      return NextResponse.json({ success: ok, message: 'Memory archived' });
    }

    if (action === 'unarchive' && memoryId) {
      const ok = db.unarchiveCuratedMemory(memoryId);
      return NextResponse.json({ success: ok, message: 'Memory unarchived' });
    }

    if (action === 'delete' && memoryId) {
      const ok = db.deleteCuratedMemory(memoryId);
      return NextResponse.json({ success: ok, message: 'Memory deleted' });
    }

    if (action === 'toggle_important' && memoryId) {
      const ok = db.toggleImportantMemory(memoryId);
      return NextResponse.json({ success: ok, message: 'Importance toggled' });
    }

    if (action === 'update' && memoryId && updates) {
      const updated = db.updateCuratedMemory(memoryId, updates);
      return NextResponse.json({ success: !!updated, data: updated });
    }

    // Default: Add memory
    const memoryData = memory || body;
    if (!memoryData.title || !memoryData.detail) {
      return NextResponse.json(
        { success: false, error: 'Title and detail are required' },
        { status: 400 }
      );
    }

    const created = db.addCuratedMemory({
      patient_id: patientId,
      title: memoryData.title,
      detail: memoryData.detail,
      category: memoryData.category || 'family',
      source: memoryData.source || 'caregiver_entered',
      status: memoryData.status || 'active',
      is_important: memoryData.is_important ?? false,
      era_decade: memoryData.era_decade,
      related_person: memoryData.related_person,
      tags: memoryData.tags || []
    });

    return NextResponse.json({
      success: true,
      data: created,
      message: 'Memory added successfully'
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to process memory action' },
      { status: 500 }
    );
  }
}
