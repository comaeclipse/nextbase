import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';

import { loadDestinationById, updateDestination } from '@/lib/destination-store';

function isAuthorized(request: NextRequest): boolean {
  const header = request.headers.get('authorization') || '';
  const isBearer = header.toLowerCase().startsWith('bearer ');
  if (!isBearer) return false;
  const token = header.slice(7);
  const secret = process.env.ADMIN_SECRET || 'default-secret';
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    return decoded.endsWith(`:${secret}`);
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = context.params;
    const destination = await loadDestinationById(id);
    if (!destination) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(destination);
  } catch (error) {
    console.error('GET admin destination error:', error);
    return NextResponse.json({ error: 'Failed to load destination' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = context.params;
    const updates = await request.json();
    if (!updates || typeof updates !== 'object') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    await updateDestination(id, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT admin destination error:', error);
    return NextResponse.json({ error: 'Failed to update destination' }, { status: 500 });
  }
}


