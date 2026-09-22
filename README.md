# Smart Detective

Smart Detective is an evidence-first, multi-chain crypto intelligence app powered by the Nansen API. It helps a user investigate a token without confusing aggregate market activity with wallet-level evidence.

The app is designed for a simple question: **what is happening in this asset, who appears to be driving the flow, and how strong is the evidence?**

## What the app does

1. Loads smart-money token candidates from Nansen across supported chains.
2. Lets the user search and select a chain and token from the loaded data.
3. Separates smart-money, whale, fresh-wallet, exchange, price, liquidity, volume, and trader signals.
4. Requests bounded wallet evidence only when the user asks to investigate a selected token.
5. Shows returned wallet rows and transfer relationships as evidence, not as a fabricated ownership graph.
6. Explains confidence, supporting evidence, counterevidence, provenance, and unavailable data in plain language.

The fish and group visuals are only a readable representation of observed wallet behavior. A group does **not** prove common ownership, insider activity, coordination, or future performance.

## Features

- Nansen token screener discovery for Ethereum, Solana, Base, Arbitrum, and BNB.
- Synchronized chain and token selectors with local search by symbol, name, or address.
- A separate full-chain catalog mode for one selected chain, paged so the user controls additional API calls.
- Smart-money, whale, fresh-wallet, exchange-flow, price, liquidity, volume, and trader context.
- Bounded token investigation using Flow Intelligence, Token Information, Who Bought/Sold, and Transfers.
- Partial-result handling when one Nansen endpoint is unavailable or not included in the account plan.
- Wallet relationship visuals based only on returned transfer edges; screen position never creates a relationship.
- Human-readable confidence and counterevidence instead of unsupported certainty.
- Server-side API key handling; the browser never receives the Nansen key.

## Requirements

- Node.js 18 or newer.
- A modern browser.
- A Nansen API key with access to the endpoints used by the account.

Smart Detective has no runtime npm dependencies. It uses Node's built-in HTTP server and `fetch`. Therefore, `npm install` is optional and does not download a dependency tree.

## Install

Clone the public repository and enter it:

```powershell
git clone https://github.com/erlikgeology/smart_detective.git
cd smart_detective
```

Create the local environment file from the safe template:

```powershell
Copy-Item .env.example .env
notepad .env
```

Add the key to `.env` on your own machine:

```dotenv
NANSEN_API_KEY=your_real_key_here
```

Never commit `.env`, paste the key into the browser, or put it in frontend code. `.env` is ignored by Git. The server also accepts the legacy variable name `nansen_api` for compatibility.

## Start the app

```powershell
npm run start
```

Open <http://127.0.0.1:4173>.

The normal app does not load saved provider fixtures or treat local snapshots as current data. It does not call Nansen when the page first opens. Select **Check live data** when you explicitly want to spend one screener call. After a successful live request, the normalized discovery and token-evidence responses are kept in this browser so a refresh does not discard the last live session; they are clearly labelled as a last-live session and can be replaced only by an explicit new request. The app can also start without a key; live requests remain unavailable until the local environment is configured.

## Verify the installation

Run the syntax checks:

```powershell
npm run check
```

With the server running, open a second terminal and run:

```powershell
npm run smoke
```

The smoke check verifies the HTML, JavaScript, CSS, configuration route, and favicon route. It does not spend a Nansen API call.

To use another port:

```powershell
$env:PORT=4174
npm run start
```

Then open <http://127.0.0.1:4174>.

## Using the investigation workflow

### 1. Check live data

Choose **Check live data**. Smart Detective makes one bounded discovery request and loads up to 50 smart-money candidate rows across the configured chains. Searching and switching between those loaded rows is local and does not make another request.

### 2. Search the loaded tokens

Use the chain selector and token search box to narrow the loaded candidates by chain, symbol, name, or address. The selected chain and token are always shown in the evidence header.

### 3. Load a full chain catalog when needed

If the candidate list is not enough, select one chain and choose **Load full chain list**. This uses the Nansen screener without the smart-money-only filter and requests up to 1,000 rows for that chain page. If more pages exist, the app shows **Load next page**; it does not silently fetch every page.

### 4. Investigate one token

Choose **Investigate this token** or **Trace this signal**. The app shows an analyzing state across the views while it requests bounded evidence for the selected token. The evidence request can use Flow Intelligence, hourly TGM Flows for smart money and whales, Token Information, buyer and seller cohorts, and Transfers. The exact returned endpoint status is shown in the evidence panel.

### 5. Read the result

- **Observed** means the value or row was returned by Nansen.
- **Inferred** means Smart Detective derived a behavioral grouping from observed traits or transfer edges.
- **Unavailable** means the endpoint or field was not returned, was rejected, or was not requested.
- **Confidence** is an uncalibrated evidence score for the displayed behavior. It is not a probability of ownership and not a price prediction.
- **Counterevidence** records signals that weaken the interpretation, such as mixed cohorts, missing wallet data, or conflicting flow direction.

The wallet map draws relationships only when the API returns wallet rows and transfer edges. Aggregate screener data remains aggregate; it is never turned into invented wallet identities.

## API budget safeguards

| User action | Provider cost | Result |
| --- | ---: | --- |
| Open the app | 0 | Loads the interface only. |
| Refresh after a successful live discovery | 0 | Reuses the clearly labelled last-live browser session. |
| Search a token | 0 | Filters already loaded rows locally. |
| Change chain or token within loaded rows | 0 | Reuses the existing response. |
| Check live data | 1 screener call | Loads up to 50 smart-money candidate rows. |
| Load full chain list | 1 screener call per page | Loads up to 1,000 rows for one selected chain. |
| Load the next catalog page | 1 screener call | Happens only after the user asks for it. |
| Investigate one token | Up to 7 bounded calls | Requests cohort aggregates, hourly smart-money/whale flows, token data, buyer/seller samples, and transfer routes. |

The app does not request premium holder labels during normal discovery or investigation. If Nansen returns a 403, rate limit, timeout, or partial response, Smart Detective preserves successful evidence and labels the unavailable part. It does not convert missing data into a fake graph or repeatedly retry a failed endpoint.

## Architecture

```text
Browser: index.html + app.js + styles.css
              |
              | same-origin JSON requests
              v
Node server: server.mjs
              |
              | server-side Nansen API key
              v
Nansen API
```

Important routes:

| Route | Purpose |
| --- | --- |
| `GET /` | Serves the Smart Detective interface. |
| `GET /api/nansen/config` | Reports whether a key is configured without exposing it. |
| `POST /api/nansen/discovery` | Runs candidate discovery or explicit single-chain catalog pagination. |
| `POST /api/nansen/token-evidence` | Runs the bounded token evidence request with partial-result handling. |

The discovery request accepts `mode: "candidates"` for the smart-money scan and `mode: "universe"` for a selected chain catalog page. The browser never calls Nansen directly.

## Troubleshooting

### The app says Nansen is not configured

Confirm that `.env` is in the project root and contains `NANSEN_API_KEY=...`. Smart Detective re-reads the local `.env` for each provider request, so changing the key does not require a process restart. Do not put the key in `index.html`, `app.js`, or browser storage.

### Nansen returns HTTP 403

Authentication and endpoint entitlement are separate. Check the key's remaining credits and the account's endpoint access. Smart Detective reports the affected endpoint and keeps successful partial evidence visible.

### The token selector is empty

Choose **Check live data** first. The repository contains no private provider fixtures, so the interface does not pretend that old data is live.

### Flow lanes show no evidence

The Flow lanes view is separate from the Signal map. Select a token and run the investigation. Smart-money and whale lanes show returned hourly TGM Flows holder-value buckets plus the signed Flow Intelligence aggregate. Fresh-wallet and exchange lanes may only have a seven-day aggregate because Nansen did not return an hourly series for those cohorts in the same response; the interface labels that limitation instead of drawing a fake trend.

### Port 4173 is busy

Set another port before starting the server, for example `$env:PORT=4174`.

## Repository contents

The repository contains the files needed to run and verify Smart Detective:

- `index.html`, `app.js`, and `styles.css` — the browser interface.
- `server.mjs` — the local server and server-side Nansen adapter.
- `package.json` — scripts and Node version requirement.
- `scripts/smoke.mjs` — dependency-free route smoke check.
- `.env.example` — an empty local configuration template.
- `.gitignore` — excludes secrets, caches, fixtures, generated output, and local files.
- `AI_SETUP_PROMPT.md` — a constrained setup and verification prompt for another AI assistant.
- `LICENSE` — project license.

Provider responses, screenshots, browser state, output folders, work plans, and old repository history are not part of the repository.

## Security and data boundary

- Keep the real API key in a local `.env` file only.
- Do not commit private wallet lists or raw provider exports.
- Do not include API keys in screenshots, issue reports, prompts, or pull requests.
- Treat Nansen responses as provider data subject to the account's terms and access rights.

## Disclaimer

Smart Detective is an analytical interface. It is not financial advice, a trading system, an ownership detector, or a guarantee of future asset performance. Verify provider coverage, timestamps, token liquidity, and counterevidence independently.

## AI-assisted setup

For a constrained installation and verification procedure, use [AI_SETUP_PROMPT.md](AI_SETUP_PROMPT.md). The prompt tells an AI assistant to stay inside this repository, preserve secrets, avoid spending Nansen credits without approval, and report exact validation results.
