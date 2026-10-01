import { mkdir, readFile, writeFile } from 'node:fs/promises';

import { LAYER_ORDER_STATEMENT } from '../src/layer-order.mjs';
import { validateContract } from '../src/validate-theme.mjs';

const contractUrl = new URL('../src/contract.json', import.meta.url);
const distUrl = new URL('../dist/', import.meta.url);
const contract = JSON.parse(await readFile(contractUrl, 'utf8'));

const errors = validateContract(contract);
if (errors.length > 0) {
  throw new Error(`Invalid token contract:\n${errors.map((error) => `- ${error}`).join('\n')}`);
}

await mkdir(distUrl, { recursive: true });
await writeFile(new URL('contract.json', distUrl), `${JSON.stringify(contract, null, 2)}\n`);
await writeFile(new URL('styles.css', distUrl), LAYER_ORDER_STATEMENT);
