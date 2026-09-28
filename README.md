# SmartForm CLI — inspect and test form submissions from your terminal

Tiny command-line helper to inspect and test your SmartForm AI forms from the terminal.

## Reserved fields reference

The CLI forwards every flag to the API as a body field. Names starting
with `_` are reserved by the API:

| CLI flag | API field | Behaviour |
|---|---|---|
| `--next <url>` | `_next` | Same-origin redirect URL. Sent in JSON body; API echoes it back in `next_url`. |
| `--subject <s>` | `_subject` | Overrides the AI-default email subject (max 200 chars). |
| `--honeypot` | `_gotcha` (non-empty) | Simulates a bot submission to verify the spam drop path. |
| anything else | as-is | Stored as a submission field, surfaced in the dashboard. |

Honeypot fields are silently dropped server-side, so spam-test runs do
not pollute the submissions table.

## Install

```bash
git clone https://github.com/yanghuai123456/smartform-cli.git
cd smartform-cli
npm install
npm link          # so `smartform-cli` is on your PATH
```

Or install once globally without linking:

```bash
npm install -g /path/to/smartform-cli
```

## Usage

```bash
# Verify a form is live (also fetches is_active)
smartform-cli verify f_abc12345 --endpoint https://api.usesmartform.com/api/v1/f

# POST a JSON submission from a file
smartform-cli submit f_abc12345 --json ./payload.json

# POST a submission with inline fields
smartform-cli submit f_abc12345 \
  --field name=Ada \
  --field email=ada@example.com \
  --field message='Hello!'

# Override endpoint (e.g. for a self-hosted instance)
smartform-cli submit f_abc12345 --json ./payload.json --endpoint http://localhost:8000/api/v1/f
```

## Options

| Flag | Description |
|---|---|
| `--endpoint <url>` | Override `https://api.usesmartform.com/api/v1/f` (e.g. for local dev). |
| `--json <file>` | Load fields from a JSON file. |
| `--field <k=v>` | Add a field. Repeatable. |
| `--next <url>` | Set `_next` (same-origin URL for browser-style redirect). |
| `--subject <s>` | Set `_subject` to override the AI-default email subject. |

Both `verify` and `submit` print the JSON response to stdout. Non-2xx exits 1.

## Response shape

```json
{
  "success": true,
  "message": "Submission received",
  "submission_id": "01HXX...",
  "is_spam": false,
  "intent": "sales",
  "next_url": null
}
```

## How the API works

- `POST {endpoint}/api/v1/f/{form_id}` — JSON or form-data, no API key.
- Honeypot: set `_gotcha` to a non-empty value to simulate a bot (submissions are
  silently discarded).

For the full contract, see https://usesmartform.com/docs.


## FAQ

### Is there a free tier?

Yes. AI spam filtering is enabled by default on every plan. AI intent
classification and high-value lead detection require a paid plan (Pro
or Business) — the dashboard enforces this and returns HTTP 402 if
you try to enable them on a free workspace.

### Do I need an API key?

No. The form posts directly to a public endpoint using only an 8-char
form ID, which is non-enumerable. The example also includes a hidden
`_gotcha` honeypot field so naive bots cannot submit.

### Do I need an account?
No. The CLI works against any form ID you provide. Useful for smoke-testing forms you already have access to without opening the dashboard.

## Related examples
[smartform-js SDK](https://github.com/yanghuai123456/smartform-js) | [Astro contact form](https://github.com/yanghuai123456/smartform-example-astro) | [Next.js contact form](https://github.com/yanghuai123456/smartform-example-nextjs)


## License

MIT.

