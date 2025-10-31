
import type {Locale, QuickGoal} from './types';

function pickFile(base: string, locale: Locale) {
  return `${base}.${locale}.json`;
}

export async function getQuickGoals(locale: Locale): Promise<QuickGoal[]> {
  const data = (await import(`@/content/${pickFile('active_campaigns', locale)}`)).default as QuickGoal[];
  return data;
}