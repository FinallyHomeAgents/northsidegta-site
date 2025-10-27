import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const eventsDir = path.resolve(__dirname, '../public/data/events');

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  const results = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return walk(fullPath);
    }

    if (entry.isFile() && entry.name.endsWith('.json')) {
      return processFile(fullPath);
    }

    return null;
  }));

  return results.flat().filter(Boolean);
}

async function processFile(filePath) {
  const original = await fs.readFile(filePath, 'utf8');
  let parsed;
  try {
    parsed = JSON.parse(original);
  } catch (error) {
    throw new Error(`Failed to parse JSON in ${filePath}: ${error.message}`);
  }

  if (parsed?.status !== 'approved') {
    return null;
  }

  parsed.status = 'pending';
  const updated = `${JSON.stringify(parsed, null, 2)}\n`;
  await fs.writeFile(filePath, updated, 'utf8');
  return filePath;
}

async function main() {
  try {
    const updatedFiles = await walk(eventsDir);
    if (updatedFiles.length === 0) {
      console.log('No files required updates.');
    } else {
      console.log('Updated files:');
      for (const file of updatedFiles) {
        console.log(` - ${path.relative(eventsDir, file)}`);
      }
    }
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}

await main();
