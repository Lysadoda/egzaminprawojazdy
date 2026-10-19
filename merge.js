// merge.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const EXPLANATIONS_PATH = path.join(__dirname, 'public', 'data', 'explanations.json');
// Put the downloaded draft file in the root directory and name it draft.json
const DRAFT_PATH = path.join(__dirname, 'draft.json');

async function mergeExplanations() {
  try {
    if (!fs.existsSync(DRAFT_PATH)) {
      console.error("❌ ERROR: Cannot find 'draft.json' in the root directory.");
      console.log("👉 Please export from the Admin UI, rename the file to 'draft.json', and place it next to this script.");
      return;
    }

    // 1. Load current explanations
    const currentData = fs.existsSync(EXPLANATIONS_PATH)
      ? JSON.parse(fs.readFileSync(EXPLANATIONS_PATH, 'utf-8'))
      : {};

    // 2. Load draft changes
    const draftData = JSON.parse(fs.readFileSync(DRAFT_PATH, 'utf-8'));

    // 3. Merge (Draft overwrites existing keys, but doesn't delete missing keys)
    const mergedData = { ...currentData, ...draftData };

    // 4. Sort keys numerically for a clean file structure
    const sortedData = Object.keys(mergedData)
      .sort((a, b) => Number(a) - Number(b))
      .reduce((obj, key) => {
        obj[key] = mergedData[key];
        return obj;
      }, {});

    // 5. Write back to src/data/explanations.json securely
    fs.writeFileSync(EXPLANATIONS_PATH, JSON.stringify(sortedData, null, 2), 'utf-8');

    // 6. Cleanup draft file
    fs.unlinkSync(DRAFT_PATH);

    console.log(`✅ SUCCESS: Merged explanations successfully! Database now has ${Object.keys(sortedData).length} explanations.`);
  } catch (err) {
    console.error("❌ CRITICAL ERROR during merge:", err.message);
  }
}

mergeExplanations();