import type {AppLocale} from '@/i18n';

export type Locale = AppLocale;

export type QuickGoal = {
  id: string;
  title: string;
  goalAmount: number;
  raisedAmount: number;
  deadline?: string;
  targetKey?: string;
  cover?: string;
};