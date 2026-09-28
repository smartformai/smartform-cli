// lib/cli.js — argument parser + dispatch.
const ENDPOINT_DEFAULT = 'https://api.usesmartform.com/api/v1/f';

function parseFlags(argv) {
  const opts = { endpoint: ENDPOINT_DEFAULT, fields: {}, jsonFile: null, next: null, subject: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--endpoint')        { opts.endpoint = argv[++i]; }
    else if (a === '--json')       { opts.jsonFile  = argv[++i]; }
    else if (a === '--field')      { const [k, ...r] = argv[++i].split('='); opts.fields[k] = r.join('='); }
    else if (a === '--next')       { opts.next      = argv[++i]; }
    else if (a === '--subject')    { opts.subject   = argv[++i]; }
    else if (a === '--help' || a === '-h') { opts.help = true; }
    else if (a.startsWith('--')) { throw new Error(`Unknown flag: ${a}`); }
    else                          { opts._positional = opts._positional || []; opts._positional.push(a); }
  }
  return opts;
}

function usage() {
  console.log(`smartform-cli — submit to / verify SmartForm AI forms

Usage:
  smartform-cli verify <form_id> [--endpoint <url>]
  smartform-cli submit <form_id> [--json <file> | --field k=v ...] [--next <url>] [--subject <s>]

Options:
  --endpoint <url>   Override endpoint (default ${ENDPOINT_DEFAULT})
  --json <file>      Load fields from a JSON file
  --field <k=v>      Add a field (repeatable)
  --next <url>       Set _next (browser-style redirect URL)
  --subject <s>      Set _subject (custom email subject)
  -h, --help         Show this help

Examples:
  smartform-cli verify f_abc12345
  smartform-cli submit f_abc12345 --field name=Ada --field email=ada@example.com
`);
}

async function cmdVerify(formId, opts) {
  const url = `${opts.endpoint.replace(/\/+$/, '')}/${formId}/verify`;
  const r = await fetch(url, { method: 'POST' });
  const body = await r.json().catch(() => ({}));
  console.log(JSON.stringify(body, null, 2));
  return r.ok ? 0 : 1;
}

async function cmdSubmit(formId, opts) {
  let body = { ...opts.fields };
  if (opts.jsonFile) {
    const raw = await (await import('node:fs/promises')).readFile(opts.jsonFile, 'utf8');
    body = { ...body, ...JSON.parse(raw) };
  }
  if (opts.next    !== null) body._next    = opts.next;
  if (opts.subject !== null) body._subject = opts.subject;
  if (!Object.keys(body).length) throw new Error('Provide --json <file> or at least one --field k=v');

  const url = `${opts.endpoint.replace(/\/+$/, '')}/${formId}`;
  const r = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body:    JSON.stringify(body),
  });
  const out = await r.json().catch(() => ({}));
  console.log(JSON.stringify(out, null, 2));
  return r.ok ? 0 : 1;
}

export async function run(argv) {
  const opts = parseFlags(argv);
  const [command, formId] = opts._positional || [];
  if (opts.help || !command) { usage(); return command ? 1 : 0; }
  if (!formId || !/^f_[A-Za-z0-9_-]{4,}$/.test(formId)) {
    console.error('smartform-cli: <form_id> must look like f_xxxxxxxx'); return 2;
  }

  if (command === 'verify') return cmdVerify(formId, opts);
  if (command === 'submit') return cmdSubmit(formId, opts);
  console.error(`smartform-cli: unknown command: ${command}`); return 2;
}
