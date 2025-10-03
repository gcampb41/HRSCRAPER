# HRSCRAPER Actor

This Actor is part of the HRSCRAPER project.

## Run locally
```bash
npm install
apify run
```

## Notes

* Minimal HTML scraping is implemented; additional enrichment can be added in future PRs.

## Troubleshooting

- **Build error: `environmentVariables must be object`**
  Ensure `.actor/actor.json` uses an object for `environmentVariables`, e.g. `{}` or `{ "API_KEY": "value" }`.

## Usage

### Apify console (UI)
Use an input like:
```json
{
  "dryRun": false,
  "startUrls": ["https://example.com"],
  "selectors": ["h1"]
}
```

Expected:

* Dataset: one item per URL with `title`, `metaDescription`, and the first match for each `selectors` entry (`selectedText` array).
* Logs: JSON lines "Fetched" and a final "run finished".

### API (curl)

```bash
curl -X POST "https://api.apify.com/v2/acts/USERNAME~hrscraper/runs?token=APIFY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dryRun": false,
    "startUrls": ["https://example.com"],
    "selectors": ["h1"]
  }'
```

### Local

```bash
npm install
echo '{
  "dryRun": false,
  "startUrls": ["https://example.com"],
  "selectors": ["h1"]
}' > INPUT.json
apify run
```

### Tuning

* `requestTimeoutMs` (default 15000)
* `maxRetries` (default 2)
