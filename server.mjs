import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4173);
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8" };

function loadDotEnv(filePath) {
  try {
    return Object.fromEntries(fs.readFileSync(filePath, "utf8").split(/\r?\n/).flatMap((line) => {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (!match || match[1].startsWith("#")) return [];
      return [[match[1], match[2].replace(/^['"]|['"]$/g, "")]];
    }));
  } catch {
    return {};
  }
}

function getNansenApiKey() {
  const env = loadDotEnv(path.join(root, ".env"));
  return env.nansen_api || env.NANSEN_API_KEY || process.env.NANSEN_API_KEY || "";
}

function sendJson(response, status, payload) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  response.end(JSON.stringify(payload));
}

async function readJsonBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (!chunks.length) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { return {}; }
}

function normalizeDiscoveryRow(row) {
  return {
    chain: row.chain || "unknown",
    tokenAddress: row.token_address || "",
    symbol: row.token_symbol || "TOKEN",
    tokenAgeDays: Number(row.token_age_days || 0),
    deploymentDate: row.token_deployment_date || null,
    marketCapUsd: Number(row.market_cap_usd || 0),
    liquidityUsd: Number(row.liquidity || 0),
    priceUsd: Number(row.price_usd || 0),
    priceChange: Number(row.price_change || 0),
    fdvUsd: Number(row.fdv || 0),
    traders: Number(row.nof_traders || 0),
    buyVolumeUsd: Number(row.buy_volume || 0),
    sellVolumeUsd: Number(row.sell_volume || 0),
    volumeUsd: Number(row.volume || 0),
    netflowUsd: Number(row.netflow || 0),
    inflowFdvRatio: Number(row.inflow_fdv_ratio || 0),
    outflowFdvRatio: Number(row.outflow_fdv_ratio || 0),
  };
}

async function runNansenDiscovery(response, request, defaults = {}) {
  const nansenApiKey = getNansenApiKey();
  if (!nansenApiKey) {
    sendJson(response, 503, { configured: false, status: "unavailable", message: "No Nansen API key is configured on the server." });
    return;
  }
  try {
    const input = await readJsonBody(request);
    const requestedChains = Array.isArray(input.chains) && input.chains.length ? [...new Set(input.chains.map((chain) => String(chain).trim()).filter(Boolean))] : (defaults.chains || ["ethereum", "solana", "base", "arbitrum", "bnb"]);
    const mode = input.mode === "universe" ? "universe" : "candidates";
    if (mode === "universe" && requestedChains.length !== 1) {
      sendJson(response, 400, { configured: true, status: "invalid_request", message: "Full token-list mode requires exactly one selected chain." });
      return;
    }
    const page = Math.max(1, Number(input.page || 1));
    const perPage = Math.min(1000, Math.max(1, Number(input.per_page || defaults.perPage || (mode === "universe" ? 1000 : 50))));
    const requestBody = {
      chains: requestedChains,
      timeframe: input.timeframe || "24h",
      pagination: { page, per_page: perPage },
      ...(mode === "candidates" ? { filters: { only_smart_money: true } } : {})
    };
    const upstream = await fetch("https://api.nansen.ai/api/v1/token-screener", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", apikey: nansenApiKey },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(20000),
    });
    const raw = await upstream.text();
    let body = {};
    try { body = raw ? JSON.parse(raw) : {}; } catch { body = {}; }
    if (!upstream.ok) {
      sendJson(response, upstream.status, { configured: true, status: "provider_error", message: body.message || body.error || `Nansen returned HTTP ${upstream.status}.` });
      return;
    }
    const rows = Array.isArray(body.data) ? body.data : body.data ? [body.data] : [];
    const data = rows.map(normalizeDiscoveryRow).filter((row) => row.tokenAddress);
    const chainText = requestedChains.map((chain) => chain).join(", ");
    const message = mode === "universe"
      ? `Loaded ${data.length} tokens from the full ${chainText} token list (page ${page}).`
      : `Live token screener returned ${data.length} smart-money candidate rows across ${chainText} (page ${page}).`;
    sendJson(response, 200, { configured: true, status: "live", mode, endpoint: "/api/v1/token-screener", rows: data.length, data, chains: requestedChains, page, per_page: perPage, pagination: body.pagination || null, message });
  } catch (error) {
    sendJson(response, 502, { configured: true, status: "network_error", message: error instanceof Error ? error.message : "Unable to reach the Nansen API." });
  }
}

async function runNansenProbe(response, request) {
  return runNansenDiscovery(response, request, { chains: ["ethereum"], perPage: 10 });
}

async function fetchNansenJson(endpoint, body) {
  const nansenApiKey = getNansenApiKey();
  const upstream = await fetch("https://api.nansen.ai" + endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", apikey: nansenApiKey },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  });
  const raw = await upstream.text();
  let data = {};
  try { data = raw ? JSON.parse(raw) : {}; } catch { data = { raw }; }
  if (!upstream.ok) {
    const error = new Error(`${endpoint} returned HTTP ${upstream.status}: ${data.message || data.error || "unknown provider error"}`);
    error.status = upstream.status;
    error.endpoint = endpoint;
    error.creditsRemaining = upstream.headers.get("X-Nansen-Credits-Remaining");
    throw error;
  }
  return {
    data,
    creditsUsed: upstream.headers.get("X-Nansen-Credits-Used"),
    creditsRemaining: upstream.headers.get("X-Nansen-Credits-Remaining"),
    requestId: upstream.headers.get("X-Request-Id"),
  };
}

async function runNansenTokenEvidence(response, request) {
  const nansenApiKey = getNansenApiKey();
  if (!nansenApiKey) {
    sendJson(response, 503, { configured: false, status: "unavailable", message: "No Nansen API key is configured on the server." });
    return;
  }
  try {
    const input = await readJsonBody(request);
    const chain = String(input.chain || "").trim();
    const tokenAddress = String(input.token_address || "").trim();
    if (!chain || !tokenAddress) {
      sendJson(response, 400, { configured: true, status: "invalid_request", message: "A chain and token_address are required." });
      return;
    }
    const timeframe = ["24h", "7d", "30d"].includes(String(input.timeframe)) ? String(input.timeframe) : "7d";
    const days = timeframe === "24h" ? 1 : timeframe === "30d" ? 30 : 7;
    const to = new Date();
    const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
    const date = { from: from.toISOString(), to: to.toISOString() };
    const requests = {
      flow_intelligence: { endpoint: "/api/v1/tgm/flow-intelligence", body: { chain, token_address: tokenAddress, timeframe } },
      token_information: { endpoint: "/api/v1/tgm/token-information", body: { chain, token_address: tokenAddress, timeframe: "1d" } },
      smart_money_flows: { endpoint: "/api/v1/tgm/flows", body: { chain, token_address: tokenAddress, date, label: "smart_money", pagination: { page: 1, per_page: 100 }, order_by: [{ field: "date", direction: "ASC" }] } },
      whale_flows: { endpoint: "/api/v1/tgm/flows", body: { chain, token_address: tokenAddress, date, label: "whale", pagination: { page: 1, per_page: 100 }, order_by: [{ field: "date", direction: "ASC" }] } },
      buyers: { endpoint: "/api/v1/tgm/who-bought-sold", body: { chain, token_address: tokenAddress, buy_or_sell: "BUY", date, pagination: { page: 1, per_page: 50 }, order_by: [{ field: "bought_volume_usd", direction: "DESC" }] } },
      sellers: { endpoint: "/api/v1/tgm/who-bought-sold", body: { chain, token_address: tokenAddress, buy_or_sell: "SELL", date, pagination: { page: 1, per_page: 50 }, order_by: [{ field: "sold_volume_usd", direction: "DESC" }] } },
      transfers: { endpoint: "/api/v1/tgm/transfers", body: { chain, token_address: tokenAddress, date, pagination: { page: 1, per_page: 50 }, filters: { include_dex: true, include_cex: true, non_exchange_transfers: true }, order_by: [{ field: "transfer_value_usd", direction: "DESC" }] } },
    };
    const entries = [];
    const failures = [];
    let creditsRemaining = null;
    for (const [name, spec] of Object.entries(requests)) {
      try {
        const result = await fetchNansenJson(spec.endpoint, spec.body);
        creditsRemaining = result.creditsRemaining || creditsRemaining;
        entries.push([name, { endpoint: spec.endpoint, body: spec.body, response: result.data, credits_used: result.creditsUsed, request_id: result.requestId }]);
      } catch (error) {
        failures.push({
          name,
          endpoint: spec.endpoint,
          status: error?.status || null,
          message: error instanceof Error ? error.message : "Nansen endpoint failed.",
          credits_remaining: error?.creditsRemaining || creditsRemaining,
        });
      }
    }
    const snapshot = {
      fetched_at: to.toISOString(),
      observation_window: { from: from.toISOString(), to: to.toISOString() },
      requests: Object.fromEntries(entries),
      failures,
    };
    if (!entries.length) {
      const firstFailure = failures[0];
      sendJson(response, 502, {
        configured: true,
        status: "provider_error",
        chain,
        tokenAddress,
        attempted: Object.keys(requests).length,
        calls: 0,
        failures,
        credits_remaining: creditsRemaining,
        message: firstFailure?.message || "Nansen returned no usable token evidence.",
      });
      return;
    }
    const status = failures.length ? "partial_live" : "live";
    const message = failures.length
      ? `Loaded ${entries.length} live Nansen endpoint responses; ${failures.length} endpoint(s) were unavailable, so the UI will label this evidence partial.`
      : `Loaded live token evidence with ${entries.length} Nansen endpoint calls. Wallet rows and transfer edges are now available for this token.`;
    sendJson(response, 200, { configured: true, status, chain, tokenAddress, attempted: Object.keys(requests).length, calls: entries.length, failures, credits_remaining: creditsRemaining, data: snapshot, message });
  } catch (error) {
    sendJson(response, 502, { configured: true, status: "provider_error", message: error instanceof Error ? error.message : "Unable to load token evidence from Nansen." });
  }
}

const server = http.createServer((request, response) => {
  const requested = decodeURIComponent((request.url || "/").split("?")[0]);
  if (request.method === "GET" && requested === "/favicon.ico") {
    response.writeHead(204);
    response.end();
    return;
  }
  const relative = requested === "/" ? "index.html" : requested.replace(/^\/+/, "");
  const filePath = path.resolve(root, relative);
  if (!filePath.startsWith(root + path.sep) || relative === ".env" || relative.startsWith(".env.")) { response.writeHead(403); response.end("Forbidden"); return; }
  if (request.method === "GET" && requested === "/api/nansen/config") {
    const configured = Boolean(getNansenApiKey());
    sendJson(response, 200, { configured, mode: configured ? "live-ready" : "unavailable" });
    return;
  }
  if (request.method === "POST" && requested === "/api/nansen/probe") {
    runNansenProbe(response, request);
    return;
  }
  if (request.method === "POST" && requested === "/api/nansen/discovery") {
    runNansenDiscovery(response, request);
    return;
  }
  if (request.method === "POST" && requested === "/api/nansen/token-evidence") {
    runNansenTokenEvidence(response, request);
    return;
  }
  if (request.method === "GET" && requested === "/fixtures/nansen/raw/manifest.json" && !fs.existsSync(filePath)) {
    sendJson(response, 200, { selected: [] });
    return;
  }
  if (request.method === "GET" && requested === "/fixtures/nansen/raw/discovery.json" && !fs.existsSync(filePath)) {
    sendJson(response, 200, { fetched_at: null, request: { chains: ["ethereum", "solana", "base", "arbitrum", "bnb"] }, response: { data: [] } });
    return;
  }
  fs.readFile(filePath, (error, data) => {
    if (error) { response.writeHead(404, { "Content-Type": "text/plain" }); response.end("Not found"); return; }
    response.writeHead(200, { "Content-Type": types[path.extname(filePath)] || "application/octet-stream", "Cache-Control": "no-store" });
    response.end(data);
  });
});

server.listen(port, "127.0.0.1", () => console.log(`Smart Detective running at http://127.0.0.1:${port}/`));
