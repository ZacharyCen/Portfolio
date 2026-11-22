# Application Atlas

A Fall 2030 university application planner built from a private planning document. The site includes planning targets, official policy links and an editable school shortlist. The source PDF and personal details are excluded. Progress and school edits use browser storage on the current device and origin.

Run `npm ci && npm run build`, then `python3 -m http.server 8765 --bind 127.0.0.1 --directory dist` and open http://127.0.0.1:8765/. The build bundles Three.js and copies the public assets into `dist`.

Roadmap targets are suggested dates, and a school deadline entered by the user is treated as a personal date. Confirm exact deadlines and time zones with the relevant application system.

GitHub Actions checks official source page text weekly and records changes or fetch failures. A fingerprint change can reflect unrelated edits. The automation flags changes for review and never rewrites deadlines. A local refresh can be run with `node scripts/check-sources.cjs`.

## Golf handicap

The initial value is self-reported. To enable the weekly RFEG lookup, add your exact federation licence number as a GitHub Actions repository secret named `RFEG_LICENCE` in Settings → Secrets and variables → Actions. Run **Deploy Application Atlas** with the refresh option to verify the setup. Only the index and check date are saved. Lookup failures preserve the last value and its original check date.

To run locally with Node 22+, set `RFEG_LICENCE` in an ignored `.env` file and run `node --env-file=.env scripts/update-handicap.cjs`. The script sends the licence only to RFEG.

## Cloudflare deployment

GitHub Actions publishes the site to [application-atlas-2030.pages.dev](https://application-atlas-2030.pages.dev/) on each push to `main`. The workflow also refreshes and deploys data every Tuesday or on demand. It commits refreshed snapshots so a later code deployment keeps the latest data. Only the generated `dist` directory is published.

In GitHub repository settings under **Secrets and variables → Actions**, add:

- `CLOUDFLARE_ACCOUNT_ID` for the account that owns the Pages project.
- `CLOUDFLARE_API_TOKEN` scoped to that account with **Cloudflare Pages → Edit**.
- `RFEG_LICENCE` to enable the optional handicap lookup.

Run **Deploy Application Atlas** from the Actions tab to verify the first deployment.
