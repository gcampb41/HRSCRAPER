# HRSCRAPER Actor

This Actor is part of the HRSCRAPER project.

## Run locally
```bash
npm install
apify run
```

## Notes

* This is a scaffold only; scraping logic will be added incrementally in later PRs.


## Troubleshooting

- **Build error: `environmentVariables must be object`**  
  Ensure `.actor/actor.json` uses an object for `environmentVariables`, e.g. `{}` or `{ "API_KEY": "value" }`.
