import type { Rule } from 'sanity';
import { defineField, defineType } from 'sanity';

type QuickGoalDocument = {
  title?: {
    en?: string;
    uk?: string;
  };
};

type QuickGoalPreview = {
  title?: string;
  subtitle?: number;
  media?: unknown;
};

export const quickGoal = defineType({
  name: 'quickGoal',
  title: 'Quick Goal',
  type: 'document',
  fields: [
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: (doc: QuickGoalDocument) => doc?.title?.en || doc?.title?.uk,
        maxLength: 96,
      },
      validation: (rule: Rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'localeString',
      validation: (rule: Rule) => rule.required(),
    }),
    defineField({
      name: 'cover',
      title: 'Cover image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (rule: Rule) => rule.required(),
    }),
    defineField({
      name: 'goalAmount',
      title: 'Goal amount',
      type: 'number',
      validation: (rule: Rule) => rule.required().min(0),
    }),
    defineField({
      name: 'raisedAmount',
      title: 'Raised amount',
      type: 'number',
      validation: (rule: Rule) => rule.required().min(0),
    }),
    defineField({
      name: 'deadline',
      title: 'Deadline',
      type: 'date',
      options: {
        dateFormat: 'YYYY-MM-DD',
      },
    }),
    defineField({
      name: 'targetKey',
      title: 'Target key',
      type: 'string',
    }),
  ],
  preview: {
    select: {
      title: 'title.en',
      subtitle: 'goalAmount',
      media: 'cover',
    },
    prepare({ title, subtitle, media }: QuickGoalPreview) {
      return {
        title: title || 'Quick goal',
        subtitle: typeof subtitle === 'number' ? `Goal: ${subtitle}` : undefined,
        media,
      };
    },
  },
});
