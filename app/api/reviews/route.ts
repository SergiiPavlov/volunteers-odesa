
import {NextResponse} from 'next/server';
import {nanoid} from 'nanoid';
import {ReviewSchema, type Review} from '../_utils/types';
import {_store} from '../_utils/store';

export async function GET() {
  return NextResponse.json({items: _store.reviews});
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = ReviewSchema.parse(json);
    const item: Review = {
      id: nanoid(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...parsed
    };
    _store.reviews.unshift(item);
    return NextResponse.json({ok: true, item}, {status: 201});
  } catch (e: any) {
    return NextResponse.json({ok: false, error: e?.message || 'Invalid payload'}, {status: 400});
  }
}