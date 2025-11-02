import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';

import { schemaTypes } from './sanity/schemas';

const projectId = process.env.SANITY_PROJECT_ID || 'your-project-id';
const dataset = process.env.SANITY_DATASET || 'production';

export default defineConfig({
  name: 'default',
  title: 'Volunteers Odesa Studio',
  projectId,
  dataset,
  plugins: [deskTool()],
  schema: {
    types: schemaTypes,
  },
});
