import { NextResponse } from 'next/server';
import { db } from '@/lib/mock-db';

export async function GET() {
  try {
    const caregiverId = db.users[0].id;
    const patients = db.getPatientsByCaregiver(caregiverId);

    return NextResponse.json({
      success: true,
      data: patients
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch patients' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, birth_year, hometown, occupation, family_members, favorite_music, favorite_meals, preferred_language, stage, state_region, favorite_festivals, cultural_traditions } = body;

    if (!name || !birth_year || !hometown) {
      return NextResponse.json(
        { success: false, error: 'Name, birth year, and hometown are required' },
        { status: 400 }
      );
    }

    // Generate unique 6-digit numeric access code
    let access_code = '';
    do {
      access_code = Math.floor(100000 + Math.random() * 900000).toString();
    } while (db.getPatientByAccessCode(access_code));

    const newPatient = db.createPatient({
      caregiver_id: db.users[0].id,
      name,
      birth_year: parseInt(birth_year, 10),
      hometown,
      occupation: occupation || 'Retired',
      state_region: state_region || 'Assam',
      favorite_festivals: favorite_festivals || '',
      cultural_traditions: cultural_traditions || '',
      family_members: family_members || [],
      favorite_music: favorite_music || '',
      favorite_meals: favorite_meals || '',
      access_code,
      preferred_language: preferred_language || 'en',
      stage: stage || 'early'
    });

    return NextResponse.json({
      success: true,
      data: newPatient
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create patient' },
      { status: 500 }
    );
  }
}
