
// Simple in-memory dev store (non-persistent). For production, replace with DB (Postgres/Prisma).
import type {Announcement, Review} from './types';

export const _store = {
  announcements: [] as Announcement[],
  reviews: [] as Review[]
};