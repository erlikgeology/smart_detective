# Smart Detective setup prompt

Copy the prompt below into an AI coding assistant after cloning this repository. It is intentionally limited to installation, verification, and safe local operation.

```text
You are setting up the Smart Detective repository.

Scope and safety:
1. Work only inside the cloned Smart Detective repository. Do not edit unrelated folders or repositories.
2. Do not print, request, upload, commit, or expose any secret value. Never ask the operator to paste an API key into chat.
3. Do not create plans, screenshots, browser recordings, raw provider exports, fixtures, or generated artifacts in the repository unless the operator explicitly asks for one.
4. Never put the Nansen key in frontend code, browser storage, logs, test output, or a commit.

Installation:
5. Check that Node.js 18 or newer is installed. If it is missing, report the exact requirement and stop before changing files.
6. If .env does not exist, copy .env.example to .env. Tell the operator to add NANSEN_API_KEY locally; do not create a fake key and do not display the value.
7. This project has no runtime npm dependencies. Do not run a package installation merely to manufacture a dependency tree. If npm metadata needs checking, inspect package.json without changing it.

Verification:
8. Run `npm run check` and record pass or fail.
9. Start the app with `npm run start` in a separate process or terminal.
10. In a second terminal, run `npm run smoke` and record pass or fail.
11. Open http://127.0.0.1:4173 and verify that the page loads, the chain selector is visible, and the token search control is usable.
12. Confirm that normal startup is live-only: it must not promote local fixtures or saved provider snapshots as current data. Opening the page must not make a Nansen request.
13. Only click `Check live data` if the operator explicitly approves spending one screener call. After a successful live response, verify that a refresh preserves it as `LAST LIVE NANSEN SESSION`, with its timestamp, without pretending it is a new provider request. If the operator explicitly investigates a token, verify that its successful token-evidence response is also preserved across refresh.
14. Confirm that search and selection reuse loaded data locally. Do not click `Load full chain list`, `Load next page`, or `Investigate this token` without explicit operator approval because those actions can spend additional Nansen calls.
15. Confirm that the browser does not contain or expose the API key.

Provider failures:
16. If Nansen returns 403, rate limit, timeout, or a partial response, report the affected endpoint and the exact visible status. Preserve successful evidence; do not invent data, bypass access control, or repeatedly retry.

Final report:
17. Report the exact commands run, each pass/fail result, the local URL, whether the key was configured (never the key itself), and any remaining operator action.
18. Leave the repository free of secrets and temporary artifacts. Do not claim success for a browser or provider check that was not actually performed.
```
