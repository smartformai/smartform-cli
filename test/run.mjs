// Smoke test for parseFlags (no network).
import assert from 'node:assert/strict';
import { run } from '../lib/cli.js';

const seen: any = {};
const origFetch = globalThis.fetch;
globalThis.fetch = (url: string, init: any) => {
  seen.url  = url;
  seen.init = init;
  return Promise.resolve(new Response(JSON.stringify({ valid: true, form_id: 'f_x', is_active: true }), { status: 200, headers: { 'content-type': 'application/json' } }));
};

const code = await run(['verify', 'f_abc12345', '--endpoint', 'https://staging/api/v1/f']);
assert.equal(code, 0);
assert.equal(seen.url, 'https://staging/api/v1/f/f_abc12345/verify');

globalThis.fetch = origFetch;
console.log('cli smoke test passed');
