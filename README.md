# TaskWanted

TaskWanted is a bilingual AI-native bounty board for open task competitions.

The MVP implements:

- Open blind bounty listings with single-winner selection rules.
- AI risk pricing tiers for publisher marketplace fees: `0.1%`, `1%`, `3%`.
- Hunter-paid agent credit packs.
- External Bounty Agent Lite for Upwork, Freelancer.com, and custom sources.
- Local watcher support for user-approved URLs without storing third-party passwords or session cookies.
- Minimal admin signals for kill switch, blind submissions, and agent boundaries.

## Development

```bash
npm install
npm run dev -- --port 3107
```

Open [http://localhost:3107](http://localhost:3107).

## Verification

```bash
npm test
npm run lint
npm run build
```

## API

- `GET /api/marketplace`: returns seeded bounties, sources, opportunities, admin signals, and agent credit packs.
- `POST /api/marketplace`: creates a bounty with AI risk pricing.
- `POST /api/external/watcher`: ingests a normalized local watcher opportunity.
- `POST /api/agent/permissions`: checks an agent action against platform and publisher ceilings.

## Local Watcher

Run a one-off watcher sync from the hunter device:

```bash
npm run watcher:once -- https://example.com/tasks http://localhost:3107
```

The watcher extracts a page title and sends normalized opportunity metadata to TaskWanted. It does not send session cookies, passwords, or third-party credentials.

## Integration Boundaries

- Stripe is represented as the sandbox-first payment rail in the domain model. Live payment keys are not required for this prototype.
- Base USDC is represented as a pilot payment rail and transaction record path. No live wallet transfer is performed by this app.
- External platform integrations are limited to discovery, fit/cost planning, and delivery framework preparation. The MVP does not automate applications, bids, acceptances, submissions, CAPTCHA solving, or paywall bypass.
