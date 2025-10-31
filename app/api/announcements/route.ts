
import {NextResponse} from 'next/server';
import {nanoid} from 'nanoid';
import {AnnouncementSchema, type Announcement} from '../_utils/types';
import {_store} from '../_utils/store';

export async function GET() {
  return NextResponse.json({items: _store.announcements});
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = AnnouncementSchema.parse(json);
    const item: Announcement = {
      id: nanoid(),
      status: 'pending',
      verified: false,
      createdAt: new Date().toISOString(),
      ...parsed
    };
    _store.announcements.unshift(item);
    return NextResponse.json({ok: true, item}, {status: 201});
  } catch (e: any) {
    return NextResponse.json({ok: false, error: e?.message || 'Invalid payload'}, {status: 400});
  }
}