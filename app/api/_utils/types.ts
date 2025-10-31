
import {z} from 'zod';

export const AnnouncementSchema = z.object({
  title: z.string().min(8).max(140),
  body: z.string().min(20).max(5000),
  contact: z.string().min(3).max(140),
  category: z.string().min(2).max(40)
});

export type AnnouncementInput = z.infer<typeof AnnouncementSchema>;

export type Announcement = AnnouncementInput & {
  id: string;
  status: 'pending'|'approved'|'rejected';
  verified: boolean;
  createdAt: string;
};


export const ReviewSchema = z.object({
  authorName: z.string().min(2).max(80),
  role: z.enum(['donor','recipient']),
  text: z.string().min(10).max(2000)
});

export type ReviewInput = z.infer<typeof ReviewSchema>;

export type Review = ReviewInput & {
  id: string;
  status: 'pending'|'approved'|'rejected';
  createdAt: string;
};