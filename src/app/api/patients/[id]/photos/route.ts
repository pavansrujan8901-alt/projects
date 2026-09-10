import { NextResponse } from 'next/server';
import { db } from '@/lib/mock-db';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const photos = db.getPhotosByPatient(id);

    return NextResponse.json({
      success: true,
      data: photos
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { file_url, person_name, relationship, era_decade, context_memory } = body;

    if (!file_url || !person_name || !relationship) {
      return NextResponse.json(
        { success: false, error: 'Photo URL, person name, and relationship are required' },
        { status: 400 }
      );
    }

    const newPhoto = db.addPhoto({
      patient_id: id,
      file_url,
      person_name,
      relationship,
      era_decade: era_decade || 'Recent',
      context_memory: context_memory || '',
      uploaded_by: db.users[0].id
    });

    return NextResponse.json({
      success: true,
      data: newPhoto
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to upload photo' },
      { status: 500 }
    );
  }
}
