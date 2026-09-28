#!/usr/bin/env node
import { run } from '../lib/cli.js';
run(process.argv.slice(2)).then(
  (code) => process.exit(code),
  (e) => { console.error(e); process.exit(1); },
);
