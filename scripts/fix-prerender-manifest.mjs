import {promises as fs} from 'node:fs';
import path from 'node:path';

const dir = path.join(process.cwd(), '.next');
const jsPath = path.join(dir, 'prerender-manifest.js');
const jsonPath = path.join(dir, 'prerender-manifest.json');

async function main() {
  try {
    const content = await fs.readFile(jsPath, 'utf8');
    const match = content.match(/self\.__PRERENDER_MANIFEST\s*=\s*"([\s\S]+)"/);
    if (!match) {
      return;
    }
    const normalized = match[1].replace(/\\"/g, '"');
    const manifest = JSON.parse(normalized);
    await fs.writeFile(jsonPath, JSON.stringify(manifest, null, 2));
  } catch (error) {
    if ((error?.code) === 'ENOENT') {
      return;
    }
    throw error;
  }
}

await main();
