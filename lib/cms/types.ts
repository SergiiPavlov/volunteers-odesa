
export type Locale = 'uk'|'en';

export type QuickGoal = {
  id: string;
  title: string;
  goalAmount: number;
  raisedAmount: number;
  deadline?: string;
  targetKey?: string;
  cover?: string;
};