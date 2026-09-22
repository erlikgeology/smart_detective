const syntheticCases = [
  {
    id: "CASE-014", version: "v2", number: "01", filter: "rising", trend: "↗", trendClass: "",
    title: "Fragmented accumulation", short: "12 small wallets · repeated buys", status: "MODERATE EVIDENCE", statusClass: "moderate",
    finding: "A school of smaller wallets is accumulating AURA in repeated rounds. The pattern is worth investigating, but common execution or shared services remain possible.",
    exposure: "$486.2K", exposureSub: "12 wallets · 0.8% of supply", flow: "+$312.8K", confidence: 78,
    confidenceDescriptor: "3 independent families", members: ["0x7a…2f", "0x91…bd", "0x3c…18", "0x44…e1", "0x8d…6a", "0xbf…04", "0x20…c8", "0x6f…91"],
    evidence: [
      { icon: "⌁", title: "Synchronized timing", text: "9 of 12 wallets entered within 18 min across 3 rounds.", meta: "OBSERVED · 3 TIME BUCKETS", strength: "84%" },
      { icon: "↗", title: "Shared funding path", text: "4 wallets share a funding source; exchange hub filtered.", meta: "OBSERVED · 4 EDGES", strength: "71%" },
      { icon: "◌", title: "Trade sequence similarity", text: "Buy sizes and token order are above the replay baseline.", meta: "INFERRED · BASELINE COMPARE", strength: "79%" }
    ],
    counter: "Shared exchange withdrawal timing could explain part of the synchronization. This is why the cluster remains an inferred hypothesis.",
    counterShort: "shared exchange timing",
    nodeSeed: 1, saved: true
  },
  {
    id: "CASE-021", version: "v1", number: "02", filter: "rising", trend: "↗", trendClass: "",
    title: "Quiet consolidation", short: "8 wallets · one destination", status: "WEAK EVIDENCE", statusClass: "weak",
    finding: "Several wallets route AURA toward one destination, but the pattern currently has only one independent evidence family.",
    exposure: "$198.4K", exposureSub: "8 wallets · 0.3% of supply", flow: "+$74.1K", confidence: 46,
    confidenceDescriptor: "1 independent family", members: ["0x2e…44", "0x70…c2", "0xa1…9f", "0xd2…ab", "0x55…10", "0x9c…e0", "0x4f…65", "0x11…d7"],
    evidence: [
      { icon: "⇢", title: "Repeated destination", text: "6 wallets sent AURA to the same observed destination.", meta: "OBSERVED · 6 TRANSFERS", strength: "62%" },
      { icon: "?", title: "Timing baseline pending", text: "The selected window is too sparse for a timing comparison.", meta: "UNAVAILABLE · MORE HISTORY NEEDED", strength: "—" }
    ],
    counter: "The destination may be a custodian, router, or treasury address. No ownership inference is made.",
    counterShort: "destination ambiguous",
    nodeSeed: 2, saved: false
  },
  {
    id: "CASE-008", version: "v3", number: "03", filter: "saved", trend: "↓", trendClass: "coral",
    title: "Distribution split", short: "5 wallets · selling into strength", status: "STRONGER SIGNAL", statusClass: "strong",
    finding: "Five wallets reduced their AURA exposure in similar intervals while price rose. This is a behavioral divergence, not a prediction.",
    exposure: "$91.7K", exposureSub: "5 wallets · 0.1% of supply", flow: "−$58.3K", confidence: 83,
    confidenceDescriptor: "4 independent families", members: ["0x18…da", "0x39…e7", "0x65…0a", "0xac…27", "0xe0…54"],
    evidence: [
      { icon: "↘", title: "Synchronized exits", text: "5 wallets reduced positions in 2 separate time buckets.", meta: "OBSERVED · 2 TIME BUCKETS", strength: "88%" },
      { icon: "◷", title: "Price divergence", text: "Outflows continued while the AURA replay price rose 6.2%.", meta: "OBSERVED · PRICE CONTEXT", strength: "81%" },
      { icon: "◌", title: "Similar trade sizes", text: "Sell sizes remain similar after wallet-relative normalization.", meta: "INFERRED · BASELINE COMPARE", strength: "76%" }
    ],
    counter: "Wallet labels are not available in this fixture. The group could represent coordinated execution without shared ownership.",
    counterShort: "labels unavailable",
    nodeSeed: 3, saved: true
  }
];

  const liveOnlyCase = {
  id: "LIVE-SETUP", version: "setup", number: "01", filter: "all", trend: "→", trendClass: "",
  title: "Connect live data", short: "No private provider data shipped", status: "LIVE DATA REQUIRED", statusClass: "moderate",
  finding: "Smart Detective does not include private provider responses. Select Check live data to load a bounded Nansen token-screener page.",
  exposure: "—", exposureSub: "Choose a live token to begin", flow: "—", confidence: 0,
  confidenceDescriptor: "Calculated after a provider response", members: [], nodeSeed: 0, saved: false,
  evidence: [
    { icon: "◎", title: "Live discovery is ready", text: "The server adapter is available, but no provider request is made automatically when the app opens.", meta: "NEXT STEP · CHECK LIVE DATA", strength: "—" },
    { icon: "?", title: "No local data included", text: "Private Nansen responses are intentionally excluded from the public repository.", meta: "UNAVAILABLE · NO PRIVATE CACHE", strength: "—" },
    { icon: "→", title: "Call budget is bounded", text: "Discovery uses one page of up to 50 rows. Search and token switching reuse the loaded response locally.", meta: "METHOD · PRESERVED API BUDGET", strength: "—" }
  ],
  counter: "No signal is calculated until a real provider response is loaded.", counterShort: "live data required"
};

let cases = syntheticCases;
let fixtureRecords = [];
let savedFixtureRecords = [];
const liveDiscoveryCacheKey = "smart-detective.live-discovery.v1";
const liveEvidenceCachePrefix = "smart-detective.live-evidence.v1:";
const demoMode = new URLSearchParams(window.location.search).get("demo") === "1";
const state = { selectedId: "CASE-014", activeKey: null, activeFixture: null, noLocalData: false, discoveryChains: ["ethereum", "solana", "base", "arbitrum", "bnb"], liveDiscoveryLoaded: false, discoveryMode: "live", observationWindow: "7d", fullChainPaging: {}, fullChainLoading: false, investigationBusy: false, investigationTitle: "", investigationText: "", investigationStep: "", revealed: false, revealStage: "ready", revealProgress: 0, selectedWallet: null, excluded: null, mapMode: "balance", filter: "all", playing: false, timeline: 63, motionPhase: 0, animation: 0, raf: null, revealTimer: null, playTimer: null };
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const selectedCase = () => cases.find((item) => item.id === state.selectedId) || cases[0];

function readLiveDiscoveryCache() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(liveDiscoveryCacheKey) || "null");
    if (!saved || !Array.isArray(saved.data) || !saved.data.length) return null;
    return saved;
  } catch {
    return null;
  }
}

function saveLiveDiscoveryCache(result) {
  try {
    const previous = readLiveDiscoveryCache();
    const incoming = Array.isArray(result.data) ? result.data : [];
    const universeChain = result.mode === "universe" && Array.isArray(result.chains) && result.chains.length === 1 ? result.chains[0] : null;
    const page = Number(result.page || 1);
    const previousRows = universeChain && page > 1
      ? (previous?.data || [])
      : universeChain
        ? (previous?.data || []).filter((row) => row.chain !== universeChain)
        : [];
    const data = [...new Map(previousRows.concat(incoming).map((row) => [row.chain + ":" + (row.tokenAddress || row.token_address || ""), row])).values()];
    window.localStorage.setItem(liveDiscoveryCacheKey, JSON.stringify({
      saved_at: new Date().toISOString(),
      fetched_at: new Date().toISOString(),
      mode: result.mode || "candidates",
      chains: [...new Set((previous?.chains || []).concat(result.chains || state.discoveryChains))],
      data
    }));
  } catch {
    // Private browsing or storage limits must not interrupt a live request.
  }
}

function liveEvidenceCacheKey(chain, tokenAddress) {
  return liveEvidenceCachePrefix + encodeURIComponent(chain) + ":" + encodeURIComponent(tokenAddress);
}

function saveLiveEvidenceCache(source, result) {
  try {
    window.localStorage.setItem(liveEvidenceCacheKey(source.chain, source.tokenAddress), JSON.stringify({
      saved_at: new Date().toISOString(),
      data: result.data,
      status: result.status || "live",
      calls: result.calls || 0,
      failures: result.failures || [],
      message: result.message || ""
    }));
  } catch {
    // Private browsing or storage limits must not interrupt a live request.
  }
}

function restoreLiveEvidenceCache(source) {
  try {
    const saved = JSON.parse(window.localStorage.getItem(liveEvidenceCacheKey(source.chain, source.tokenAddress)) || "null");
    if (!saved?.data) return source;
    const liveFixture = buildFixture({ chain: source.chain, token_address: source.tokenAddress, token_symbol: source.symbol, fetched_at: saved.data.fetched_at }, saved.data);
    liveFixture.key = source.key;
    liveFixture.isLive = true;
    liveFixture.isCached = false;
    liveFixture.isSessionCache = Boolean(source.isSessionCache);
    liveFixture.screener = source.screener;
    liveFixture.hasWalletEvidence = Boolean(liveFixture.buyers.length || liveFixture.sellers.length || liveFixture.transfers.length);
    liveFixture.liveEvidenceAttempted = true;
    liveFixture.liveCalls = saved.calls || 0;
    liveFixture.liveStatus = saved.status || "live";
    liveFixture.liveFailures = Array.isArray(saved.failures) ? saved.failures : [];
    liveFixture.liveMessage = saved.message || "";
    return liveFixture;
  } catch {
    return source;
  }
}

function numeric(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function firstResponse(raw, name) {
  const data = raw && raw.requests && raw.requests[name] && raw.requests[name].response
    ? raw.requests[name].response.data
    : null;
  return Array.isArray(data) ? (data[0] || {}) : (data || {});
}

function responseRows(raw, name) {
  const data = raw && raw.requests && raw.requests[name] && raw.requests[name].response
    ? raw.requests[name].response.data
    : [];
  return Array.isArray(data) ? data : data ? [data] : [];
}

function formatMoney(value, signed = false) {
  if (value === null || value === undefined || value === "") return "—";
  const amount = numeric(value);
  const sign = amount < 0 ? "−" : signed && amount > 0 ? "+" : "";
  const absolute = Math.abs(amount);
  let body = "";
  if (absolute >= 1000000000) body = (absolute / 1000000000).toFixed(2) + "B";
  else if (absolute >= 1000000) body = (absolute / 1000000).toFixed(2) + "M";
  else if (absolute >= 1000) body = (absolute / 1000).toFixed(1) + "K";
  else body = absolute < 1 && absolute > 0 ? absolute.toFixed(2) : absolute.toFixed(0);
  return sign + "$" + body;
}

function compactAddress(address) {
  const value = String(address || "");
  return value.length > 13 ? value.slice(0, 6) + "…" + value.slice(-4) : value || "unknown wallet";
}

function formatObservedDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "fixture timestamp unavailable";
  return new Intl.DateTimeFormat("en", { month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC" }).format(date) + " UTC";
}

function scoreFromStrengths(values) {
  const numericValues = values.map((value) => Number(value)).filter(Number.isFinite);
  if (!numericValues.length) return 42;
  return Math.min(92, Math.round(numericValues.reduce((sum, value) => sum + value, 0) / numericValues.length + Math.max(0, numericValues.length - 1) * 2));
}

function seriesWindow(series) {
  const dates = series.map((row) => row.date || row.bucket_end).filter(Boolean).sort();
  return { from: dates[0] || "", to: dates[dates.length - 1] || "", count: dates.length };
}

function buildWalletGraph(buyers, sellers, transfers) {
  const byAddress = new Map();
  const edges = [];
  const ensure = (address) => {
    const key = String(address || "");
    if (!key) return null;
    if (!byAddress.has(key)) byAddress.set(key, { address: key, labels: [], boughtUsd: 0, soldUsd: 0, tradedUsd: 0, transferInUsd: 0, transferOutUsd: 0, transferCount: 0, sourceKinds: new Set() });
    return byAddress.get(key);
  };
  const addLabel = (wallet, label) => { if (wallet && label && !wallet.labels.includes(label)) wallet.labels.push(label); };

  buyers.forEach((row) => {
    const wallet = ensure(row.address);
    if (!wallet) return;
    wallet.boughtUsd += numeric(row.bought_volume_usd);
    wallet.soldUsd += numeric(row.sold_volume_usd);
    wallet.tradedUsd += numeric(row.trade_volume_usd);
    wallet.sourceKinds.add("who-bought/sold");
    addLabel(wallet, row.address_label);
  });
  sellers.forEach((row) => {
    const wallet = ensure(row.address);
    if (!wallet) return;
    wallet.boughtUsd += numeric(row.bought_volume_usd);
    wallet.soldUsd += numeric(row.sold_volume_usd);
    wallet.tradedUsd += numeric(row.trade_volume_usd);
    wallet.sourceKinds.add("who-bought/sold");
    addLabel(wallet, row.address_label);
  });
  transfers.forEach((row) => {
    const from = ensure(row.from_address);
    const to = ensure(row.to_address);
    const value = numeric(row.transfer_value_usd);
    if (from) { from.transferOutUsd += value; from.transferCount += 1; from.sourceKinds.add("transfers"); addLabel(from, row.from_address_label); }
    if (to) { to.transferInUsd += value; to.transferCount += 1; to.sourceKinds.add("transfers"); addLabel(to, row.to_address_label); }
    if (from && to && from.address !== to.address) edges.push({ from: from.address, to: to.address, value, timestamp: row.block_timestamp, hash: row.transaction_hash });
  });

  const rankedAll = [...byAddress.values()].map((wallet) => {
    const netBuyUsd = wallet.boughtUsd - wallet.soldUsd;
    const label = wallet.labels.find(Boolean) || "unlabelled address";
    const labelLower = label.toLowerCase();
    const isWhale = labelLower.includes("whale") || labelLower.includes("billionaire");
    const direction = netBuyUsd > 1 ? "buyer" : netBuyUsd < -1 ? "seller" : "balanced trader";
    const role = isWhale ? "Nansen-labelled whale" : direction === "buyer" ? "top buyer row" : direction === "seller" ? "top seller row" : wallet.transferCount ? "transfer participant" : "top trader row";
    return { ...wallet, label, isWhale, netBuyUsd, direction, role, activityUsd: wallet.tradedUsd + wallet.transferInUsd + wallet.transferOutUsd };
  }).sort((a, b) => b.activityUsd - a.activityUsd);
  const priority = rankedAll.filter((wallet) => wallet.sourceKinds.has("who-bought/sold")).slice(0, 10);
  const ranked = [...new Map(rankedAll.slice(0, 12).concat(priority).map((wallet) => [wallet.address, wallet])).values()].slice(0, 18);
  const visible = new Map(ranked.map((wallet) => [wallet.address, wallet]));
  const adjacency = new Map(ranked.map((wallet) => [wallet.address, new Set()]));
  const visibleEdges = edges.filter((edge) => visible.has(edge.from) && visible.has(edge.to));
  visibleEdges.forEach((edge) => { adjacency.get(edge.from).add(edge.to); adjacency.get(edge.to).add(edge.from); });

  const components = [];
  const visited = new Set();
  ranked.forEach((wallet) => {
    if (visited.has(wallet.address)) return;
    const component = [];
    const queue = [wallet.address];
    visited.add(wallet.address);
    while (queue.length) {
      const address = queue.shift();
      component.push(visible.get(address));
      adjacency.get(address).forEach((neighbor) => { if (!visited.has(neighbor)) { visited.add(neighbor); queue.push(neighbor); } });
    }
    components.push(component);
  });
  const groups = components.filter((component) => component.length >= 2).sort((a, b) => b.reduce((sum, wallet) => sum + wallet.activityUsd, 0) - a.reduce((sum, wallet) => sum + wallet.activityUsd, 0)).map((wallets, index) => {
    const addresses = new Set(wallets.map((wallet) => wallet.address));
    const groupEdges = visibleEdges.filter((edge) => addresses.has(edge.from) && addresses.has(edge.to));
    const totalActivity = wallets.reduce((sum, wallet) => sum + wallet.activityUsd, 0);
    return { id: "G" + String(index + 1).padStart(2, "0"), wallets, edges: groupEdges, edgeCount: groupEdges.length, totalActivity, largestShare: totalActivity ? Math.round(Math.max(...wallets.map((wallet) => wallet.activityUsd)) / totalActivity * 100) : 0, relationship: "direct transfer connectivity" };
  });
  const groupForAddress = new Map();
  groups.forEach((group) => group.wallets.forEach((wallet) => groupForAddress.set(wallet.address, group.id)));
  const nodeByAddress = new Map(ranked.map((wallet, index) => [wallet.address, { ...wallet, id: "wallet-" + index, groupId: groupForAddress.get(wallet.address) || null, cluster: Boolean(groupForAddress.get(wallet.address)), links: [...(adjacency.get(wallet.address) || [])] }]));
  return { wallets: ranked.map((wallet) => nodeByAddress.get(wallet.address)), groups: groups.map((group) => ({ ...group, wallets: group.wallets.map((wallet) => nodeByAddress.get(wallet.address)) })), edges: visibleEdges, ungroupedCount: ranked.filter((wallet) => !groupForAddress.has(wallet.address)).length };
}

function buildFixtureCases(fixture) {
  if (fixture.isLive && !fixture.hasWalletEvidence) return buildLiveCases(fixture);
  const metrics = fixture.metrics;
  const smartPositive = metrics.smartNet >= 0;
  const smartTitle = smartPositive ? "Smart-money accumulation" : "Smart-money distribution";
  const smartVerb = smartPositive ? "accumulating" : "reducing exposure to";
  const smartScore = scoreFromStrengths([72, metrics.smartWallets > 0 ? 68 : 44, fixture.smartSeries.length > 2 ? 66 : 48]);
  const divergenceScore = scoreFromStrengths([82, metrics.whaleNet * metrics.smartNet < 0 ? 78 : 56, metrics.exchangeNet * metrics.smartNet < 0 ? 73 : 51]);
  const freshScore = scoreFromStrengths([65, metrics.freshNet * metrics.smartNet < 0 ? 74 : 55, fixture.transfers.length > 10 ? 62 : 44]);
  const common = {
    version: "fixture",
    exposure: formatMoney(metrics.volumeUsd || metrics.marketCapUsd),
    exposureSub: metrics.holders ? metrics.holders.toLocaleString("en-US") + " holders · " + fixture.chain : "holder count unavailable",
    members: fixture.wallets.map((wallet) => compactAddress(wallet.address)),
    memberDetails: fixture.wallets.map((wallet) => ({ address: wallet.address, label: wallet.label, role: wallet.role })),
    nodeSeed: fixture.chain.length,
    saved: false,
  };
  return [
    {
      ...common,
      id: "FIXTURE-SMART",
      number: "01",
      filter: "rising",
      trend: smartPositive ? "↗" : "↘",
      trendClass: smartPositive ? "" : "coral",
      title: smartTitle,
      short: metrics.smartWallets + " smart wallets · " + formatMoney(metrics.smartNet, true),
      status: smartScore >= 70 ? "STRONGER SIGNAL" : "MODERATE EVIDENCE",
      statusClass: smartScore >= 70 ? "strong" : "moderate",
      finding: metrics.smartWallets + " tracked smart-money wallets are " + smartVerb + " " + fixture.symbol + " across the saved seven-day window. This is an observed provider flow lane, not an ownership claim.",
      flow: formatMoney(metrics.smartNet, true),
      confidence: smartScore,
      confidenceDescriptor: "smart-money lane · " + metrics.smartWallets + " wallets",
      evidence: [
        { icon: "↗", title: "Smart-money flow", text: "Provider flow intelligence reports " + formatMoney(metrics.smartNet, true) + " net flow across the selected window.", meta: "OBSERVED · FLOW INTELLIGENCE", strength: "72%" },
        { icon: "◌", title: "Wallet breadth", text: metrics.smartWallets + " wallets are represented in the smart-trader lane.", meta: "OBSERVED · PROVIDER COUNT", strength: metrics.smartWallets > 0 ? "68%" : "—" },
        { icon: "◷", title: "Repeated time buckets", text: fixture.smartSeries.length + " saved smart-money buckets are available for replay.", meta: "OBSERVED · FIXTURE SERIES", strength: fixture.smartSeries.length > 2 ? "66%" : "—" }
      ],
      counter: "Flow intelligence is a label-based provider signal. It does not establish common ownership, and the snapshot does not include premium holder labels.",
      counterShort: "ownership unavailable"
    },
    {
      ...common,
      id: "FIXTURE-DIVERGENCE",
      number: "02",
      filter: "rising",
      trend: metrics.whaleNet * metrics.smartNet < 0 ? "↕" : "→",
      trendClass: metrics.whaleNet * metrics.smartNet < 0 ? "coral" : "",
      title: "Whale / smart-money divergence",
      short: "whale " + formatMoney(metrics.whaleNet, true) + " · smart " + formatMoney(metrics.smartNet, true),
      status: divergenceScore >= 70 ? "STRONGER SIGNAL" : "WEAK EVIDENCE",
      statusClass: divergenceScore >= 70 ? "strong" : "weak",
      finding: "Whale flow and smart-money flow are compared as separate lanes for " + fixture.symbol + ". Divergence is useful context for review, but it is not a prediction of price or intent.",
      flow: formatMoney(metrics.whaleNet, true),
      confidence: divergenceScore,
      confidenceDescriptor: "cross-lane comparison · not ownership",
      evidence: [
        { icon: "↕", title: "Cross-lane divergence", text: "Smart-money is " + formatMoney(metrics.smartNet, true) + " while whale flow is " + formatMoney(metrics.whaleNet, true) + ".", meta: "OBSERVED · TWO PROVIDER LANES", strength: metrics.whaleNet * metrics.smartNet < 0 ? "82%" : "56%" },
        { icon: "◈", title: "Exchange context", text: "Exchange-labelled net flow is " + formatMoney(metrics.exchangeNet, true) + ".", meta: "OBSERVED · EXCHANGE LANE", strength: metrics.exchangeNet * metrics.smartNet < 0 ? "73%" : "51%" },
        { icon: "?", title: "Label limits", text: "Provider labels describe flow cohorts; they do not identify a shared controller.", meta: "UNAVAILABLE · OWNERSHIP", strength: "—" }
      ],
      counter: "Whale and smart-money cohorts can overlap or use different provider rules. Treat this as a review queue signal, not a calibrated probability.",
      counterShort: "cohort rules differ"
    },
    {
      ...common,
      id: "FIXTURE-FRESH",
      number: "03",
      filter: "saved",
      trend: metrics.freshNet >= 0 ? "↗" : "↘",
      trendClass: metrics.freshNet >= 0 ? "" : "coral",
      title: "Fresh-wallet pressure",
      short: "fresh flow " + formatMoney(metrics.freshNet, true) + " · " + fixture.transfers.length + " transfers",
      status: freshScore >= 70 ? "MODERATE EVIDENCE" : "WEAK EVIDENCE",
      statusClass: freshScore >= 70 ? "moderate" : "weak",
      finding: "Fresh-wallet flow and saved transfer records provide a second lens on " + fixture.symbol + ". This lane helps explain whether activity is broad, routed, or concentrated.",
      flow: formatMoney(metrics.freshNet, true),
      confidence: freshScore,
      confidenceDescriptor: "fresh-wallet lane · transfer context",
      evidence: [
        { icon: "◌", title: "Fresh-wallet flow", text: "Provider flow intelligence reports " + formatMoney(metrics.freshNet, true) + " net fresh-wallet flow.", meta: "OBSERVED · FRESH WALLET LANE", strength: metrics.freshNet !== 0 ? "65%" : "—" },
        { icon: "⇢", title: "Transfer context", text: fixture.transfers.length + " saved transfer rows are available for route inspection.", meta: "OBSERVED · TRANSFERS", strength: fixture.transfers.length > 10 ? "62%" : "—" },
        { icon: "◷", title: "Buyer / seller split", text: fixture.buyers.length + " buyer rows and " + fixture.sellers.length + " seller rows are saved for comparison.", meta: "OBSERVED · WHO BOUGHT / SOLD", strength: fixture.buyers.length && fixture.sellers.length ? "66%" : "—" }
      ],
      counter: "Fresh-wallet and exchange counts can be unavailable or provider-defined even when net flow is present. The app preserves that limitation.",
      counterShort: "provider count limits"
    }
  ];
}

function buildFixture(entry, raw) {
  const tokenInfo = firstResponse(raw, "token_information");
  const intelligence = firstResponse(raw, "flow_intelligence");
  const smartSeries = responseRows(raw, "smart_money_flows");
  const whaleSeries = responseRows(raw, "whale_flows");
  const buyers = responseRows(raw, "buyers");
  const sellers = responseRows(raw, "sellers");
  const transfers = responseRows(raw, "transfers");
  const details = tokenInfo.token_details || {};
  const spot = tokenInfo.spot_metrics || {};
  const walletGraph = buildWalletGraph(buyers, sellers, transfers);
  const wallets = walletGraph.wallets;
  const latestEvent = transfers[0] && transfers[0].block_timestamp || raw.fetched_at || entry.fetched_at;
  const fixture = {
    key: entry.chain + ":" + entry.token_address,
    file: entry.file,
    chain: entry.chain,
    tokenAddress: entry.token_address,
    symbol: tokenInfo.symbol || entry.token_symbol || "TOKEN",
    name: tokenInfo.name || entry.token_symbol || "Token",
    fetchedAt: raw.fetched_at || entry.fetched_at,
    latestEvent,
    raw,
    smartSeries,
    whaleSeries,
    buyers,
    sellers,
    transfers,
    groups: walletGraph.groups,
    graphEdges: walletGraph.edges,
    ungroupedCount: walletGraph.ungroupedCount,
    wallets,
    metrics: {
      smartNet: numeric(intelligence.smart_trader_net_flow_usd),
      whaleNet: numeric(intelligence.whale_net_flow_usd),
      exchangeNet: numeric(intelligence.exchange_net_flow_usd),
      freshNet: numeric(intelligence.fresh_wallets_net_flow_usd),
      smartWallets: numeric(intelligence.smart_trader_wallet_count),
      whaleWallets: numeric(intelligence.whale_wallet_count),
      holders: numeric(spot.total_holders),
      marketCapUsd: numeric(details.market_cap_usd),
      volumeUsd: numeric(spot.volume_total_usd),
      liquidityUsd: numeric(spot.liquidity_usd)
    }
  };
  fixture.cases = buildFixtureCases(fixture);
  return fixture;
}

function buildLiveCases(fixture) {
  const row = fixture.screener;
  const netflow = numeric(row.netflowUsd);
  const priceChange = numeric(row.priceChange);
  const flowDirection = netflow >= 0 ? "net inflow" : "net outflow";
  const divergence = netflow !== 0 && priceChange !== 0 && Math.sign(netflow) !== Math.sign(priceChange);
  const imbalance = Math.abs(numeric(row.buyVolumeUsd) - numeric(row.sellVolumeUsd));
  const pressureScore = scoreFromStrengths([netflow !== 0 ? 62 : 35, row.traders > 0 ? 58 : 35, row.volumeUsd > 0 ? 55 : 35]);
  const divergenceScore = scoreFromStrengths([divergence ? 82 : 44, priceChange !== 0 ? 64 : 34, netflow !== 0 ? 58 : 34]);
  const freshScore = scoreFromStrengths([imbalance > 0 ? 48 : 30, row.traders > 0 ? 42 : 30, row.inflowFdvRatio || row.outflowFdvRatio ? 46 : 30]);
  const common = {
    version: fixture.isCached ? "cached" : "live",
    exposure: formatMoney(row.marketCapUsd || row.volumeUsd),
    exposureSub: row.traders ? row.traders.toLocaleString("en-US") + " traders · " + chainLabel(fixture.chain) : "trader count unavailable",
    members: [],
    memberDetails: [],
    nodeSeed: fixture.chain.length,
    saved: false,
  };
  return [
    {
      ...common,
      id: "LIVE-SCREENED",
      number: "01",
      filter: "rising",
      trend: netflow >= 0 ? "↗" : "↘",
      trendClass: netflow >= 0 ? "" : "coral",
      title: "Smart-money screen candidate",
      short: "token screener · " + formatMoney(netflow, true) + " netflow",
      status: pressureScore >= 70 ? "STRONGER SIGNAL" : "MODERATE EVIDENCE",
      statusClass: pressureScore >= 70 ? "strong" : "moderate",
      finding: "Nansen's token screener returned " + fixture.symbol + " as a smart-money-filtered candidate. The displayed netflow is a token-level screener observation; no wallet graph is claimed until wallet endpoints are requested.",
      flow: formatMoney(netflow, true),
      confidence: pressureScore,
      confidenceDescriptor: "live screener · aggregate only",
      evidence: [
        { icon: "↗", title: "Live token-screener result", text: "Nansen returned this token in the selected smart-money screen with " + formatMoney(netflow, true) + " netflow (" + flowDirection + ").", meta: "OBSERVED · /api/v1/token-screener", strength: "72%" },
        { icon: "◌", title: "Market activity context", text: formatMoney(row.volumeUsd) + " volume, " + formatMoney(row.liquidityUsd) + " liquidity, and " + (row.traders || 0).toLocaleString("en-US") + " traders were returned with the row.", meta: "OBSERVED · SCREENER ROW", strength: row.volumeUsd || row.liquidityUsd ? "62%" : "—" },
        { icon: "?", title: "Wallet-level proof not loaded", text: "This low-call discovery pass did not request transfers, holders, or related wallets, so no fish are drawn for this live candidate.", meta: "UNAVAILABLE · PRESERVED CALL BUDGET", strength: "—" }
      ],
      counter: "A screener candidate is not proof that every smart-money-labelled wallet is buying. Confirm the token with flow, holder, and transfer endpoints before treating it as an investment signal.",
      counterShort: "aggregate candidate"
    },
    {
      ...common,
      id: "LIVE-DIVERGENCE",
      number: "02",
      filter: "rising",
      trend: divergence ? "⇄" : "→",
      trendClass: divergence ? "coral" : "",
      title: "Price / netflow divergence",
      short: "price " + (priceChange >= 0 ? "+" : "") + priceChange.toFixed(2) + "% · flow " + formatMoney(netflow, true),
      status: divergence ? "REVIEW SIGNAL" : "WEAK EVIDENCE",
      statusClass: divergence ? "strong" : "weak",
      finding: divergence ? "Price moved " + (priceChange >= 0 ? "up" : "down") + " while token netflow moved in the opposite direction. That disagreement is why this case is separate from the smart-money screen candidate." : "The live row does not show a clear price/netflow disagreement, so this comparison remains a weak review case.",
      flow: (priceChange >= 0 ? "+" : "") + priceChange.toFixed(2) + "%",
      confidence: divergenceScore,
      confidenceDescriptor: "two aggregate fields · not wallet ownership",
      evidence: [
        { icon: "⇄", title: "Opposite aggregate direction", text: divergence ? "Price change and token netflow have opposite signs in the same live screener row." : "Price and netflow do not currently have opposite signs.", meta: "OBSERVED · PRICE + NETFLOW", strength: divergence ? "82%" : "44%" },
        { icon: "◷", title: "Same snapshot", text: "Both values come from the same live token-screener response, not from two mismatched dates.", meta: "OBSERVED · ONE PROVIDER RESPONSE", strength: priceChange !== 0 && netflow !== 0 ? "64%" : "—" },
        { icon: "?", title: "No whale comparison yet", text: "Whale and smart-money flow endpoints were deliberately not called during discovery. This is price/netflow divergence, not whale/smart-money divergence.", meta: "UNAVAILABLE · NEXT ANALYSIS STEP", strength: "—" }
      ],
      counter: "Price/netflow divergence can come from market-making, liquidity changes, or a short observation window. It does not reveal who caused the move.",
      counterShort: "causal owner unknown"
    },
    {
      ...common,
      id: "LIVE-FRESH",
      number: "03",
      filter: "saved",
      trend: imbalance ? "↗" : "→",
      trendClass: "",
      title: "Fresh-wallet pressure check",
      short: "buy/sell imbalance · wallet cohort not loaded",
      status: "NEEDS WALLET DATA",
      statusClass: "weak",
      finding: "This is intentionally a separate check: the screener row contains market activity, but it does not include a fresh-wallet count. The app refuses to turn that missing field into a fish cluster.",
      flow: "—",
      confidence: freshScore,
      confidenceDescriptor: "not measurable from discovery response",
      evidence: [
        { icon: "◌", title: "Market pressure context", text: formatMoney(row.buyVolumeUsd) + " buy volume versus " + formatMoney(row.sellVolumeUsd) + " sell volume gives a first-pass imbalance of " + formatMoney(imbalance) + ".", meta: "OBSERVED · SCREENER ROW", strength: imbalance ? "48%" : "—" },
        { icon: "?", title: "Fresh-wallet count missing", text: "The discovery response contains no fresh-wallet address list or count, so this signal cannot identify new wallets yet.", meta: "UNAVAILABLE · NO FRESH WALLET ENDPOINT", strength: "—" },
        { icon: "→", title: "Next call is explicit", text: "A future token investigation can request Flow Intelligence and transfers for this one token; that is where a fresh-wallet cohort can become testable.", meta: "NEXT STEP · EXTRA PROVIDER CALLS", strength: "—" }
      ],
      counter: "Buy/sell imbalance is not fresh-wallet pressure. This case is shown to make the missing evidence visible rather than silently reusing the smart-money map.",
      counterShort: "fresh cohort unavailable"
    }
  ];
}

function buildLiveFixture(row) {
  const key = "live:" + row.chain + ":" + row.tokenAddress;
  const fixture = {
    key,
    isLive: true,
    file: null,
    chain: row.chain,
    tokenAddress: row.tokenAddress,
    symbol: row.symbol || "TOKEN",
    name: row.symbol || "Live token",
    fetchedAt: new Date().toISOString(),
    latestEvent: new Date().toISOString(),
    raw: null,
    screener: row,
    smartSeries: [],
    whaleSeries: [],
    buyers: [],
    sellers: [],
    transfers: [],
    groups: [],
    graphEdges: [],
    ungroupedCount: 0,
    wallets: [],
    metrics: { smartNet: row.netflowUsd, whaleNet: null, exchangeNet: null, freshNet: null, smartWallets: null, whaleWallets: null, holders: null, marketCapUsd: row.marketCapUsd, volumeUsd: row.volumeUsd, liquidityUsd: row.liquidityUsd }
  };
  fixture.cases = buildLiveCases(fixture);
  return fixture;
}

function normalizeDiscoveryRow(row) {
  return {
    chain: row.chain || "unknown",
    tokenAddress: row.token_address || row.tokenAddress || "",
    symbol: row.token_symbol || row.symbol || "TOKEN",
    tokenAgeDays: numeric(row.token_age_days),
    deploymentDate: row.token_deployment_date || row.deploymentDate || null,
    marketCapUsd: numeric(row.market_cap_usd ?? row.marketCapUsd),
    liquidityUsd: numeric(row.liquidity ?? row.liquidityUsd),
    priceUsd: numeric(row.price_usd ?? row.priceUsd),
    priceChange: numeric(row.price_change ?? row.priceChange),
    fdvUsd: numeric(row.fdv ?? row.fdvUsd),
    traders: numeric(row.nof_traders ?? row.traders),
    buyVolumeUsd: numeric(row.buy_volume ?? row.buyVolumeUsd),
    sellVolumeUsd: numeric(row.sell_volume ?? row.sellVolumeUsd),
    volumeUsd: numeric(row.volume ?? row.volumeUsd),
    netflowUsd: numeric(row.netflow ?? row.netflowUsd),
    inflowFdvRatio: numeric(row.inflow_fdv_ratio ?? row.inflowFdvRatio),
    outflowFdvRatio: numeric(row.outflow_fdv_ratio ?? row.outflowFdvRatio)
  };
}

function buildCachedDiscoveryFixture(row, fetchedAt) {
  const fixture = buildLiveFixture(row);
  fixture.key = "cached:" + row.chain + ":" + row.tokenAddress;
  fixture.isCached = true;
  fixture.fetchedAt = fetchedAt || fixture.fetchedAt;
  fixture.latestEvent = fixture.fetchedAt;
  fixture.cases = buildLiveCases(fixture);
  return fixture;
}

function fixtureSourceLabel(fixture) {
  if (fixture?.isSessionCache) return "LAST LIVE NANSEN SESSION";
  if (fixture?.isCached) return "CACHED NANSEN DATA";
  if (fixture?.isLive) return "LIVE NANSEN DATA";
  return "SAVED NANSEN DATA";
}

function fixtureLoadMessage(fixture) {
  const source = fixture?.isSessionCache ? "last live Nansen session" : fixture?.isCached ? "cached Nansen discovery" : fixture?.isLive ? "live Nansen discovery" : "saved Nansen snapshot";
  return `Loaded ${source} for ${fixture.symbol} on ${chainLabel(fixture.chain)}. ${fixture?.isSessionCache || fixture?.isCached || !fixture?.isLive ? "No provider request was made." : fixture.hasWalletEvidence ? `${fixture.liveCalls || 7} endpoint calls were used.` : "Wallet endpoints were not called."}`;
}

function showNoLocalDataState() {
  state.noLocalData = true;
  cases = [liveOnlyCase];
  state.selectedId = liveOnlyCase.id;
  const cards = $$(".metric-card");
  const labels = ["NET FLOW", "PRICE CONTEXT", "TRACKED WALLETS", "SIGNALS"];
  cards.forEach((card, index) => {
    const label = card.querySelector(".metric-label");
    const value = card.querySelector(":scope > strong");
    const sub = card.querySelector(".metric-sub");
    if (label) label.textContent = labels[index] || "LIVE DATA";
    if (value) value.textContent = "—";
    if (sub) sub.innerHTML = "Load live Nansen data<small>no provider request made</small>";
  });
  $(".wallet-dots").innerHTML = "";
  $(".cluster-bars").innerHTML = "<b>WAITING FOR LIVE DATA</b>";
  if ($(".coverage-ring")) $(".coverage-ring").textContent = "—";
  if ($(".coverage-mini b")) $(".coverage-mini b").textContent = "Live only";
  if ($(".coverage-score strong")) $(".coverage-score strong").textContent = "0";
  if ($(".coverage-score span")) $(".coverage-score span").innerHTML = "/ 6 lanes<br />mapped";
  if ($(".tab-count")) $(".tab-count").textContent = "0/6";
  $(".rail-heading h2").innerHTML = "Signal queue <span>01</span>";
  const queueButtons = $$(".queue-filter");
  if (queueButtons[0]) queueButtons[0].textContent = "All 1";
  if (queueButtons[1]) queueButtons[1].textContent = "Rising 0";
  if (queueButtons[2]) queueButtons[2].textContent = "Saved 0";
  $(".ocean-toolbar .section-kicker").textContent = "SIGNAL MAP · LIVE API";
  $(".toolbar-explanation").textContent = "Load live Nansen data to see token-level evidence and wallet relationships.";
  $(".observed-time, #observedTime").textContent = "waiting for live provider response";
  $(".map-corner-label.top-left b").textContent = "NO TOKEN SELECTED";
  $(".map-corner-label.bottom-right").innerHTML = "LIVE API ONLY<br /><b>NO WALLET GRAPH</b>";
  $("#oceanCanvas").setAttribute("aria-label", "No live token loaded. Select Check live data to begin.");
  $(".mode-badge").innerHTML = '<span class="pulse-dot"></span> LIVE API NOT LOADED';
  const table = $("#laneTable");
  if (table) table.innerHTML = '<div class="lane-method"><b>Live data required</b><span>The published build contains no private provider responses. Select Check live data to load one bounded Nansen discovery page.</span></div>';
  const provenanceText = $(".provenance span:nth-child(2)");
  if (provenanceText) provenanceText.innerHTML = "<b>Data provenance</b><br />No private data shipped · no live request";
}

function signalScope(fixture, item = selectedCase()) {
  if (!fixture) return { wallets: [], groups: [], edges: [], ungroupedCount: 0, reason: "No asset is selected." };
  if (fixture.isLive && !fixture.hasWalletEvidence) return { wallets: [], groups: [], edges: [], ungroupedCount: 0, reason: "Live discovery only returned aggregate token-screening data. Wallets, transfers, and holder labels were not requested, so the map stays empty instead of inventing a graph." };
  const all = fixture.wallets || [];
  const groupMatches = (predicate) => fixture.groups.filter((group) => group.wallets.some(predicate));
  let groups = [];
  let wallets = [];
  let reason = "Only directly connected wallets relevant to this signal are shown.";
  if (item.id === "FIXTURE-SMART") {
    groups = groupMatches((wallet) => wallet.direction === "buyer");
    const grouped = new Set(groups.flatMap((group) => group.wallets.map((wallet) => wallet.address)));
    wallets = all.filter((wallet) => grouped.has(wallet.address) || (wallet.direction === "buyer" && !wallet.groupId));
    reason = "Smart-money view keeps buyer-labelled rows and their directly connected transfer partners. It does not merge wallets because they are merely close on screen.";
  } else if (item.id === "FIXTURE-DIVERGENCE") {
    groups = groupMatches((wallet) => wallet.isWhale || wallet.direction === "seller")
      .filter((group) => group.wallets.some((wallet) => wallet.direction === "buyer") || group.wallets.some((wallet) => wallet.isWhale));
    const grouped = new Set(groups.flatMap((group) => group.wallets.map((wallet) => wallet.address)));
    wallets = all.filter((wallet) => grouped.has(wallet.address) || wallet.isWhale || wallet.direction === "seller");
    reason = "Divergence view keeps whale-labelled and selling rows together only for comparison. They remain separate cohorts; a line means a saved transfer edge, not agreement.";
  } else if (item.id === "FIXTURE-FRESH") {
    const fresh = all.filter((wallet) => /fresh|new wallet|new address/i.test(wallet.label || "") || /fresh|new wallet|new address/i.test(wallet.role || ""));
    groups = groupMatches((wallet) => fresh.some((candidate) => candidate.address === wallet.address));
    const grouped = new Set(groups.flatMap((group) => group.wallets.map((wallet) => wallet.address)));
    wallets = fresh.concat(all.filter((wallet) => grouped.has(wallet.address) && !fresh.some((candidate) => candidate.address === wallet.address)));
    reason = fresh.length ? "Fresh-wallet-labelled rows and their direct transfer partners are shown. The group is not treated as smart money without a provider label." : "The saved response has a fresh-wallet aggregate but no fresh-wallet address rows. No fish are drawn because the wallet-level evidence is missing.";
  } else {
    wallets = all;
    groups = fixture.groups;
  }
  const allowed = new Set(wallets.map((wallet) => wallet.address));
  const scopedGroups = groups.map((group) => ({ ...group, wallets: group.wallets.filter((wallet) => allowed.has(wallet.address)), edges: group.edges.filter((edge) => allowed.has(edge.from) && allowed.has(edge.to)) })).filter((group) => group.wallets.length >= 2);
  const scopedEdges = (fixture.graphEdges || []).filter((edge) => allowed.has(edge.from) && allowed.has(edge.to));
  const groupedAddresses = new Set(scopedGroups.flatMap((group) => group.wallets.map((wallet) => wallet.address)));
  return { wallets, groups: scopedGroups, edges: scopedEdges, ungroupedCount: wallets.filter((wallet) => !groupedAddresses.has(wallet.address)).length, reason };
}

function chainLabel(chain) {
  return String(chain || "").replace(/(^|-)([a-z])/g, (match, separator, letter) => separator + letter.toUpperCase());
}

function ensureClarityUI() {
  const heroHeading = $(".hero-copy h1");
  if (heroHeading) heroHeading.innerHTML = "See what moves<br /><em>before</em> the market.";
  const heroCopy = $(".hero-copy p");
  if (heroCopy) heroCopy.textContent = "Compare smart-money, whale, fresh-wallet, and exchange flow so you can see who is accumulating, distributing, or moving in opposite directions.";
  const heroEyebrow = $(".eyebrow");
  if (heroEyebrow) heroEyebrow.innerHTML = '<span class="eyebrow-line"></span> TRACE THE SIGNAL';
  const exploreButton = $("#exploreButton");
  if (exploreButton) exploreButton.innerHTML = "<span>Start investigation</span><span class=\"button-arrow\">↗</span>";
  const heroAside = $(".hero-aside");
  if (heroAside) {
    heroAside.innerHTML = '<div class="read-this-card"><span class="section-kicker">HOW TO READ THIS</span><strong>Signals become a herd only when their behavior lines up.</strong><p>Colors identify flow lanes. Lines show an observed relationship. The whale shape is a visual summary of wallets with similar timing, direction, and route patterns.</p></div>';
  }
  const modeBadge = $(".mode-badge");
  if (modeBadge) modeBadge.innerHTML = '<span class="pulse-dot"></span> LIVE API NOT LOADED';
  const tabs = $$(".view-tab");
  if (tabs[0]) tabs[0].innerHTML = '<span class="tab-icon">◉</span> Signal map';
  if (tabs[1]) tabs[1].innerHTML = '<span class="tab-icon">⌁</span> Flow lanes';
  if (tabs[2]) tabs[2].innerHTML = '<span class="tab-icon">◇</span> Data coverage <span class="tab-count">4/6</span>';
  const queueHeading = $(".rail-heading h2");
  if (queueHeading) queueHeading.innerHTML = 'Signal queue <span>03</span>';
  const railFooter = $(".rail-footer");
  if (railFooter) railFooter.innerHTML = '<span class="tiny-lock">⌁</span><span>Each signal explains <b>what was observed</b>,<br />what was inferred, and what could be wrong.</span>';
  const toolbarKicker = $(".ocean-toolbar .section-kicker");
  if (toolbarKicker) toolbarKicker.textContent = "SIGNAL MAP · LIVE EVIDENCE";
  const toolbarHeading = $(".ocean-toolbar h2");
  if (toolbarHeading) toolbarHeading.textContent = "Follow the money";
  const toolbarCopy = document.createElement("p");
  toolbarCopy.className = "toolbar-explanation";
  toolbarCopy.textContent = "Trace the selected flow. The map groups only wallets connected by observed transfer edges; isolated wallets stay outside.";
  const toolbarTitle = $(".ocean-toolbar > div");
  if (toolbarTitle && !toolbarTitle.querySelector(".toolbar-explanation")) toolbarTitle.appendChild(toolbarCopy);
  const oceanStage = $(".ocean-stage-panel");
  const frame = $(".ocean-frame");
  if (oceanStage && frame && !$("#investigationGuide")) {
    const guide = document.createElement("div");
    guide.id = "investigationGuide";
    guide.className = "investigation-guide";
    guide.innerHTML = '<div class="guide-top"><strong id="investigationStage">Ready to trace</strong><span id="stageCounter">1 / 3</span></div><div class="guide-steps"><span data-guide-step="trace">1. Trace observed edges</span><span data-guide-step="group">2. Keep groups separate</span><span data-guide-step="explain">3. Explain the evidence</span></div><p id="mapNarrative">The map is a visual aid. Nothing is grouped until you ask the app to investigate the selected signal.</p>';
    oceanStage.insertBefore(guide, frame);
  }
  const legend = $(".map-legend > div");
  if (legend) legend.innerHTML = '<span class="legend-item"><i class="legend-fish cyan"></i> smart money</span><span class="legend-item"><i class="legend-fish amber"></i> selected wallet</span><span class="legend-item"><i class="legend-fish coral"></i> selling / exchange</span><span class="legend-item"><i class="legend-outline"></i> matched behavior group</span>';
  const legendNote = $(".legend-note");
  if (legendNote) legendNote.textContent = "Lines = observed relationships · whale = visual group summary";
  const annotation = $(".annotation-cluster span:last-child");
  if (annotation) annotation.textContent = "pattern hub";
  const selectedKicker = $(".evidence-panel .section-kicker");
  if (selectedKicker) selectedKicker.textContent = "SELECTED SIGNAL";
  const memberHeading = $(".wallet-section h3");
  if (memberHeading) memberHeading.textContent = "Wallets in this signal";
  const memberGrid = $("#memberGrid");
  if (memberGrid && !$("#walletSelectionNote")) {
    const note = document.createElement("div");
    note.id = "walletSelectionNote";
    note.className = "wallet-selection-note";
    note.textContent = "Click a wallet to highlight it in the map and see its role.";
    memberGrid.insertAdjacentElement("afterend", note);
  }
  const investigateButton = $("#investigateButton");
  if (investigateButton) investigateButton.innerHTML = '<span class="sonar-mini">◉</span> Trace this signal';
  const provenance = $(".provenance");
  if (provenance) provenance.innerHTML = '<span class="provenance-icon">⌁</span><span><b>Data provenance</b><br />Saved Nansen snapshot · no live request</span><button id="provenanceButton" aria-label="Open provenance details">↗</button>';
  const atlasKicker = $(".atlas-heading .section-kicker");
  if (atlasKicker) atlasKicker.textContent = "FLOW LANES · PROVIDER EVIDENCE";
  const atlasHeading = $(".atlas-heading h2");
  if (atlasHeading) atlasHeading.textContent = "What moved, and in which direction?";
  const atlasCopy = $(".atlas-heading p");
  if (atlasCopy) atlasCopy.textContent = "Each lane answers a different question. Select one to inspect its time buckets, direction, routes, and what the provider response does not prove.";
  $(".timeline-bar")?.remove();
  const atlasCard = $(".atlas-card");
  if (atlasCard) {
    atlasCard.classList.add("flow-atlas-card");
    atlasCard.innerHTML = '<div id="laneTable" class="lane-table" aria-live="polite"></div><section id="flowLaneDetail" class="flow-lane-detail" aria-live="polite" aria-label="Selected flow lane details"></section>';
  }
  const atlasFootnote = $(".atlas-footnote");
  if (atlasFootnote) atlasFootnote.innerHTML = '<span class="legend-line cyan-line"></span> Flow Intelligence = seven-day cohort net flow <span class="legend-outline violet-outline"></span> TGM Flows = hourly holder-value context <span class="footnote-warning">Transfers are the only grouping edge</span>';
}

function mountFixtureControls() {
  const controls = $$(".filter-select");
  if (controls.length < 2 || $("#chainSelect")) return;
  controls[0].outerHTML = '<label class="filter-select"><span class="filter-icon">◈</span><span><small>CHAIN</small><select id="chainSelect" aria-label="Choose chain"></select></span><span class="chevron">⌄</span></label>';
  controls[1].outerHTML = '<label class="filter-select"><span class="filter-icon token-icon">✦</span><span><small>TOKEN</small><select id="tokenSelect" aria-label="Choose token"></select></span><span class="chevron">⌄</span></label>';
}

function mountWindowControl() {
  const button = $("#windowButton") || $$(".filter-select")[2];
  if (!button || $("#windowMenu")) return;
  button.id = "windowButton";
  button.type = "button";
  button.setAttribute("aria-haspopup", "listbox");
  button.setAttribute("aria-expanded", "false");
  button.innerHTML = '<span class="filter-icon">◷</span><span><small>WINDOW</small><b id="windowValue">Last 7 days</b></span><span class="chevron" aria-hidden="true">⌄</span>';
  const wrapper = document.createElement("div");
  wrapper.className = "window-filter-wrap";
  button.parentElement?.insertBefore(wrapper, button);
  wrapper.appendChild(button);
  const menu = document.createElement("div");
  menu.id = "windowMenu";
  menu.className = "window-menu";
  menu.hidden = true;
  menu.setAttribute("role", "listbox");
  menu.setAttribute("aria-label", "Observation window");
  menu.innerHTML = '<button type="button" role="option" data-window="24h" aria-selected="false"><strong>Last 24 hours</strong><small>Fast current snapshot</small></button><button type="button" role="option" data-window="7d" aria-selected="true"><strong>Last 7 days</strong><small>Default investigation window</small></button><button type="button" role="option" data-window="30d" aria-selected="false"><strong>Last 30 days</strong><small>Broader trend context</small></button>';
  wrapper.appendChild(menu);
  $$(".filter-select").filter((control) => control.querySelector("select")).forEach((control) => {
    control.classList.add("native-filter-select");
    const select = control.querySelector("select");
    control.addEventListener("click", (event) => {
      if (event.target === select) return;
      select.focus();
      try { select.showPicker?.(); } catch { /* Native picker may be unavailable. */ }
    });
  });
}

function observationWindowLabel(value = state.observationWindow) {
  return ({ "24h": "Last 24 hours", "7d": "Last 7 days", "30d": "Last 30 days" })[value] || "Last 7 days";
}

function setObservationWindow(value) {
  if (!(value in { "24h": true, "7d": true, "30d": true })) return;
  state.observationWindow = value;
  const label = observationWindowLabel(value);
  const valueNode = $("#windowValue");
  if (valueNode) valueNode.textContent = label;
  $$("#windowMenu [data-window]").forEach((option) => option.setAttribute("aria-selected", String(option.dataset.window === value)));
  const button = $("#windowButton");
  if (button) button.setAttribute("aria-label", "Observation window: " + label);
  toggleWindowMenu(false);
  showToast(label + " selected. Refresh live data to request this window from Nansen.");
}

function toggleWindowMenu(force) {
  const menu = $("#windowMenu");
  const button = $("#windowButton");
  if (!menu || !button) return;
  const open = typeof force === "boolean" ? force : menu.hidden;
  menu.hidden = !open;
  button.setAttribute("aria-expanded", String(open));
}

function mountSearchableTokenControl() {
  const tokenSelect = $("#tokenSelect");
  if (!tokenSelect || $("#tokenSearch")) return;
  const field = tokenSelect.parentElement;
  if (!field) return;
  field.classList.add("token-filter-body");
  const search = document.createElement("input");
  search.id = "tokenSearch";
  search.type = "search";
  search.setAttribute("aria-label", "Search loaded tokens");
  search.placeholder = "Search symbol, name, or address";
  search.autocomplete = "off";
  field.insertBefore(search, tokenSelect);
  const meta = document.createElement("span");
  meta.id = "tokenSearchMeta";
  meta.className = "token-search-meta";
  meta.setAttribute("aria-live", "polite");
  field.appendChild(meta);
}

function activeCatalogChain() {
  return $("#chainSelect")?.value || state.discoveryChains[0] || "ethereum";
}

function updateTokenCatalogControls() {
  const chain = activeCatalogChain();
  const fullButton = $("#fullChainButton");
  const nextButton = $("#nextTokenPageButton");
  const status = $("#tokenLoadStatus");
  const hint = $("#tokenLoadHint");
  const paging = state.fullChainPaging[chain];
  const loadedCount = fixtureRecords.filter((fixture) => fixture.chain === chain).length;
  if (fullButton) {
    fullButton.disabled = Boolean(state.fullChainLoading);
    fullButton.textContent = paging ? "Refresh full chain list" : "Load full chain list";
    fullButton.title = "One selected-chain request, without the smart-money-only filter. Results are still paginated by Nansen.";
  }
  if (nextButton) {
    nextButton.hidden = !paging?.hasMore || state.fullChainLoading;
    nextButton.disabled = Boolean(state.fullChainLoading);
    nextButton.textContent = paging ? `Load page ${paging.page + 1}` : "Load next page";
  }
  if (paging) {
    if (status) status.textContent = `${loadedCount.toLocaleString("en-US")} full-list rows loaded · page ${paging.page}`;
    if (hint) hint.textContent = paging.hasMore ? "Nansen has more pages for this chain. Load the next page only when you need it." : "Nansen marked this chain page as complete.";
  } else if (state.discoveryMode === "candidates") {
    if (status) status.textContent = `${loadedCount.toLocaleString("en-US")} smart-money candidates loaded`;
    if (hint) hint.textContent = "Candidate mode is filtered and credit-safe. Full chain loading is available for the selected chain.";
  } else if (status) {
    status.textContent = loadedCount ? `${loadedCount.toLocaleString("en-US")} cached rows loaded` : "No cached rows for this chain";
    if (hint) hint.textContent = "Check live data for candidates, or load the full selected chain on demand.";
  }
}

function renderFixtureOptions(options = {}) {
  const chainSelect = $("#chainSelect");
  const tokenSelect = $("#tokenSelect");
  if (!chainSelect || !tokenSelect) return;
  const chains = [...new Set(state.discoveryChains.concat(fixtureRecords.map((fixture) => fixture.chain)).filter(Boolean))];
  if (!fixtureRecords.length) {
    const activeChain = chains.includes(chainSelect.value) ? chainSelect.value : chains[0];
    chainSelect.replaceChildren(...chains.map((chain) => {
      const option = document.createElement("option");
      option.value = chain;
      option.textContent = chainLabel(chain) + " - no cached tokens";
      return option;
    }));
    chainSelect.value = activeChain;
    tokenSelect.replaceChildren(Object.assign(document.createElement("option"), { textContent: "Use Check live data to load tokens", disabled: true }));
    tokenSelect.disabled = true;
    const meta = $("#tokenSearchMeta");
    if (meta) meta.textContent = "No local token data shipped";
    updateTokenCatalogControls();
    return;
  }
  const requestedChain = options.chain && chains.includes(options.chain) ? options.chain : "";
  const activeChain = requestedChain || (state.activeFixture && chains.includes(state.activeFixture.chain) ? state.activeFixture.chain : "") || (chains.includes(chainSelect.value) ? chainSelect.value : chains[0]);
  chainSelect.replaceChildren(...chains.map((chain) => {
    const option = document.createElement("option");
    const count = fixtureRecords.filter((fixture) => fixture.chain === chain).length;
    option.value = chain;
    option.textContent = chainLabel(chain) + " - " + count + (count === 1 ? " token" : " tokens");
    return option;
  }));
  chainSelect.value = activeChain;

  const search = $("#tokenSearch");
  if (options.resetSearch && search) search.value = "";
  const query = String(search?.value || "").trim().toLowerCase();
  const chainTokens = fixtureRecords.filter((fixture) => fixture.chain === activeChain);
  const visibleTokens = query ? chainTokens.filter((fixture) => [fixture.symbol, fixture.name, fixture.tokenAddress].join(" ").toLowerCase().includes(query)) : chainTokens;
  tokenSelect.replaceChildren(...visibleTokens.map((fixture) => {
    const option = document.createElement("option");
    option.value = fixture.key;
    option.textContent = (fixture.isSessionCache ? "LAST LIVE - " : fixture.isCached ? "CACHED - " : fixture.isLive ? "LIVE - " : "SAVED - ") + fixture.symbol + " / " + fixture.name;
    option.title = fixture.tokenAddress || fixture.name;
    return option;
  }));
  const activeKey = state.activeFixture && state.activeFixture.chain === activeChain ? state.activeFixture.key : "";
  tokenSelect.value = visibleTokens.some((fixture) => fixture.key === activeKey) ? activeKey : (query ? "" : (visibleTokens[0]?.key || ""));
  tokenSelect.disabled = !visibleTokens.length;
  if (!visibleTokens.length) {
    const empty = document.createElement("option");
    empty.textContent = query ? "No loaded token matches" : "No tokens loaded for this chain";
    empty.disabled = true;
    tokenSelect.append(empty);
  }
  const meta = $("#tokenSearchMeta");
  if (meta) meta.textContent = query ? `${visibleTokens.length} of ${chainTokens.length} loaded tokens match` : `${chainTokens.length} loaded ${chainTokens.length === 1 ? "token" : "tokens"} on this chain`;
  updateTokenCatalogControls();
}

function setSparkline(selector, series) {
  const bars = $$(selector + " span");
  const values = series.slice(-bars.length).map((row) => Math.abs(numeric(row.value_usd)));
  const maximum = Math.max(1, ...values);
  bars.forEach((bar, index) => {
    const value = values[index] || 0;
    bar.style.height = Math.max(8, Math.round(value / maximum * 92)) + "%";
  });
}

function escapeFlowText(value) {
  return String(value ?? "").replace(/[&<>\"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[character]));
}

function flowLaneDefinitions(fixture) {
  const metrics = fixture.metrics || {};
  const smartSeries = Array.isArray(fixture.smartSeries) ? fixture.smartSeries : [];
  const whaleSeries = Array.isArray(fixture.whaleSeries) ? fixture.whaleSeries : [];
  if (fixture.isLive && !fixture.liveEvidenceAttempted) {
    const row = fixture.screener || {};
    return [
      { key: "screened", color: "cyan", name: "Screened token netflow", value: formatMoney(row.netflowUsd, true), direction: "candidate row", source: "Token Screener", window: "same live response", context: "No wallet timeline requested", meaning: "A token-level candidate field. It is not a wallet count and does not identify a trading group.", caseId: "LIVE-SCREENED", detailTitle: "Token-screener candidate", detailText: "Discovery returned one aggregate candidate row. Flow Intelligence, wallet trades, and transfer routes are not loaded for this token yet." },
      { key: "price", color: "amber", name: "Price context", value: (numeric(row.priceChange) >= 0 ? "+" : "") + numeric(row.priceChange).toFixed(2) + "%", direction: "same snapshot", source: "Token Screener", window: "same live response", context: "Compared with candidate netflow", meaning: "A comparison field for divergence. It does not explain who caused the price move.", caseId: "LIVE-DIVERGENCE", detailTitle: "Price / netflow comparison", detailText: "This is a divergence check between two fields in the same screener response, not a wallet-level flow lane." },
      { key: "market", color: "violet", name: "Market activity", value: formatMoney(row.volumeUsd), direction: "screened volume", source: "Token Screener", window: "same live response", context: (row.traders || 0).toLocaleString("en-US") + " traders", meaning: "Context for activity behind the candidate. It is not fresh-wallet pressure.", caseId: "LIVE-FRESH", detailTitle: "Market activity context", detailText: "The discovery row gives volume and trader context only. Fresh-wallet and exchange cohorts need the token evidence request." },
      { key: "wallets", color: "coral", name: "Wallet cohorts", value: "NOT LOADED", direction: "provider call needed", source: "Token evidence", window: "not requested", context: "No historical wallet lanes", meaning: "Smart-money, whale, fresh-wallet, and exchange lanes remain unclaimed until token evidence is requested.", caseId: null, detailTitle: "Wallet lanes are not loaded", detailText: "The app has not requested the token-level wallet endpoints for this candidate. Nothing is substituted or drawn as zero." }
    ];
  }
  const changeText = (series, window) => {
    if (series.length < 2) return "No hourly holder-value history returned";
    const delta = numeric(series[series.length - 1].value_usd) - numeric(series[0].value_usd);
    return "Holder value " + (delta >= 0 ? "rose " : "fell ") + formatMoney(Math.abs(delta)) + " across " + window.count + " hourly buckets";
  };
  const smartWindow = seriesWindow(smartSeries);
  const whaleWindow = seriesWindow(whaleSeries);
  return [
    { key: "smart", color: "cyan", name: "Smart-money cohort", value: formatMoney(metrics.smartNet, true), direction: metrics.smartNet >= 0 ? "net inflow" : "net outflow", source: "Flow Intelligence", window: "7d aggregate", context: changeText(smartSeries, smartWindow), range: smartWindow, series: smartSeries, seriesLabel: "Smart-money holder value", meaning: "Nansen-labelled smart-trader cohort. The seven-day value is a provider aggregate; the hourly line shows holder-value context, not a second net-flow total.", caseId: "FIXTURE-SMART", detailTitle: "Smart-money holder-value timeline", detailText: "This lane combines the seven-day Flow Intelligence net-flow aggregate with the hourly TGM Flows holder-value buckets. A rising holder value can include price movement, so it is not interpreted as fresh capital by itself." },
    { key: "whale", color: "amber", name: "Whale cohort", value: formatMoney(metrics.whaleNet, true), direction: metrics.whaleNet >= 0 ? "net inflow" : "net outflow", source: "Flow Intelligence", window: "7d aggregate", context: changeText(whaleSeries, whaleWindow), range: whaleWindow, series: whaleSeries, seriesLabel: "Whale holder value", meaning: "Separate whale-labelled cohort. It can disagree with smart money; that disagreement is a review signal, not proof of one controller.", caseId: "FIXTURE-DIVERGENCE", detailTitle: "Whale holder-value timeline", detailText: "This is a different provider cohort from smart money. The two lines are compared, never merged into one ownership claim." },
    { key: "fresh", color: "violet", name: "Fresh-wallet cohort", value: formatMoney(metrics.freshNet, true), direction: metrics.freshNet >= 0 ? "net inflow" : "net outflow", source: "Flow Intelligence", window: "7d aggregate", context: "Aggregate only in this response", range: { from: null, to: null, count: 0 }, series: [], seriesLabel: "Fresh-wallet timeline", meaning: "New-wallet pressure is context, not proof of informed buying or selling. Nansen returned an aggregate here, not an hourly series in this response.", caseId: "FIXTURE-FRESH", detailTitle: "Fresh-wallet aggregate", detailText: "Fresh-wallet flow is available as a seven-day provider aggregate. No hourly fresh-wallet series was returned, so the app does not draw an invented trend." },
    { key: "exchange", color: "coral", name: "Exchange cohort", value: formatMoney(metrics.exchangeNet, true), direction: metrics.exchangeNet >= 0 ? "net inflow" : "net outflow", source: "Flow Intelligence", window: "7d aggregate", context: "Aggregate only in this response", range: { from: null, to: null, count: 0 }, series: [], seriesLabel: "Exchange timeline", meaning: "Exchange-labelled movement is kept apart from smart money. One aggregate cannot establish a rise, fall, deposit, or sale by itself.", caseId: null, detailTitle: "Exchange aggregate", detailText: "Exchange flow is available as a seven-day provider aggregate. The current response has no hourly exchange series, so the lane clearly shows that limit." }
  ];
}

function flowLaneDate(row) {
  return row?.bucket_end || row?.date || "";
}

function renderFlowTimeline(lane) {
  const series = (lane.series || []).slice(-48);
  if (series.length < 2) {
    return '<div class="flow-timeline-empty"><strong>Timeline unavailable for this lane</strong><span>' + escapeFlowText(lane.detailText || "Nansen returned an aggregate without hourly buckets for this cohort.") + '</span></div>';
  }
  const values = series.map((row) => numeric(row.value_usd));
  const maximum = Math.max(1, ...values.map((value) => Math.abs(value)));
  const bars = series.map((row, index) => {
    const value = numeric(row.value_usd);
    const height = Math.max(8, Math.round(Math.abs(value) / maximum * 92));
    const date = flowLaneDate(row);
    return '<span class="flow-time-bar ' + (value < 0 ? "negative" : "positive") + '" style="height:' + height + '%" title="' + escapeFlowText(formatObservedDate(date) + " · " + formatMoney(value)) + '" aria-label="' + escapeFlowText(formatObservedDate(date) + " holder value " + formatMoney(value)) + '"></span>';
  }).join("");
  const first = flowLaneDate(series[0]);
  const last = flowLaneDate(series[series.length - 1]);
  return '<div class="flow-timeline"><div class="flow-timeline-head"><span>HOURLY HOLDER-VALUE BUCKETS</span><b>' + series.length + ' returned</b></div><div class="flow-time-bars ' + lane.color + '">' + bars + '</div><div class="flow-timeline-foot"><span>' + escapeFlowText(formatObservedDate(first)) + '</span><span>bar height = absolute holder value</span><span>' + escapeFlowText(formatObservedDate(last)) + '</span></div></div>';
}

function renderFlowLaneDetail(fixture, index = 0) {
  const detail = $("#flowLaneDetail");
  if (!detail) return;
  const lanes = flowLaneDefinitions(fixture);
  const lane = lanes[index] || lanes[0];
  if (!lane) return;
  const transfers = (fixture.transfers || []).slice(0, 4);
  const buys = (fixture.buyers || []).slice(0, 2);
  const sells = (fixture.sellers || []).slice(0, 2);
  const activityRows = buys.map((row) => '<li><b>BUY</b><span>' + escapeFlowText(row.address_label || compactAddress(row.address)) + '</span><strong>' + formatMoney(row.bought_volume_usd) + '</strong></li>').concat(sells.map((row) => '<li><b class="sell">SELL</b><span>' + escapeFlowText(row.address_label || compactAddress(row.address)) + '</span><strong>' + formatMoney(row.sold_volume_usd) + '</strong></li>')).join("");
  const routeRows = transfers.map((row) => '<li><span>' + escapeFlowText(row.from_address_label || compactAddress(row.from_address)) + '</span><b>→</b><span>' + escapeFlowText(row.to_address_label || compactAddress(row.to_address)) + '</span><strong>' + formatMoney(row.transfer_value_usd) + '</strong></li>').join("");
  detail.innerHTML = '<div class="flow-detail-header"><div><span class="section-kicker">SELECTED FLOW LANE</span><h3><i class="lane-dot ' + lane.color + '"></i>' + escapeFlowText(lane.detailTitle || lane.name) + '</h3><p>' + escapeFlowText(lane.detailText || lane.meaning) + '</p></div><div class="flow-detail-value"><small>7D NET FLOW</small><strong>' + escapeFlowText(lane.value) + '</strong><span>' + escapeFlowText(lane.direction) + '</span></div></div><div class="flow-detail-grid"><div><small>WHAT THE LANE MEANS</small><p>' + escapeFlowText(lane.meaning) + '</p></div><div><small>PROVIDER WINDOW</small><p>' + escapeFlowText(lane.context) + '</p><span>' + escapeFlowText(lane.range?.from ? formatObservedDate(lane.range.from) + " → " + formatObservedDate(lane.range.to) : "No hourly range returned") + '</span></div></div>' + renderFlowTimeline(lane) + '<div class="flow-detail-columns"><div><div class="flow-detail-subhead"><span>OBSERVED TRADE SAMPLE</span><small>WHO BOUGHT / SOLD</small></div>' + (activityRows ? '<ul class="flow-detail-list">' + activityRows + '</ul>' : '<p class="flow-detail-unavailable">No wallet trade rows were returned for this session.</p>') + '</div><div><div class="flow-detail-subhead"><span>OBSERVED ROUTES</span><small>TRANSFERS, NOT OWNERSHIP</small></div>' + (routeRows ? '<ul class="flow-route-list">' + routeRows + '</ul>' : '<p class="flow-detail-unavailable">No transfer routes were returned for this session.</p>') + '</div></div><div class="flow-detail-note"><b>Read this carefully</b><span>' + escapeFlowText(lane.key === "smart" || lane.key === "whale" ? "The chart is holder-value context; the signed net-flow number is the separate Flow Intelligence aggregate." : "This lane has an aggregate only. The app keeps missing time buckets visible instead of fabricating a line.") + '</span></div>';
  $$(".lane-row[data-lane-index]").forEach((row) => row.classList.toggle("lane-selected", Number(row.dataset.laneIndex) === index));
}

function updateAtlasLegacy(fixture) {
  const table = $("#laneTable");
  if (table) {
    if (state.investigationBusy) {
      const title = state.investigationTitle || "Analyzing selected token";
      const text = state.investigationText || "Comparing the selected evidence across the investigation views.";
      table.innerHTML = '<div class="lane-analyzing"><span class="lane-analyzing-pulse" aria-hidden="true"></span><div><strong>' + title + '</strong><p>' + text + '</p><small>Flow lanes will populate when this step finishes. No empty result is being treated as zero activity.</small></div></div>';
      $(".atlas-badge").textContent = fixture.symbol + " Â· ANALYZING";
      $(".atlas-flow")?.setAttribute("aria-label", "Analyzing flow lanes for " + fixture.symbol + " on " + chainLabel(fixture.chain));
      return;
    }
    if (fixture.isLive && !fixture.hasWalletEvidence) {
      const row = fixture.screener;
      const rows = [
        { color: "cyan", name: "Screened token netflow", value: formatMoney(row.netflowUsd, true), source: "Token Screener", context: "Same live response", meaning: "Aggregate token movement returned with a smart-money-filtered candidate. This is not a wallet count." },
        { color: "amber", name: "Price context", value: (numeric(row.priceChange) >= 0 ? "+" : "") + numeric(row.priceChange).toFixed(2) + "%", source: "Token Screener", context: "Same live response", meaning: "Used only to test whether price and netflow point in opposite directions." },
        { color: "violet", name: "Market activity", value: formatMoney(row.volumeUsd), source: "Token Screener", context: (row.traders || 0).toLocaleString("en-US") + " traders", meaning: "Context for how much activity sits behind the candidate row." },
        { color: "coral", name: "Wallet cohorts", value: "NOT LOADED", source: "No extra endpoint called", context: "Preserved API budget", meaning: "Smart-money, whale, fresh-wallet, and exchange wallet lanes are not claimed until a token investigation requests them." }
      ];
      table.innerHTML = '<div class="lane-row lane-header"><span>LIVE FIELD / SOURCE</span><span>OBSERVED</span><span>TIME CONTEXT</span><span>HOW TO READ IT</span></div>' + rows.map((item) => '<div class="lane-row"><div class="lane-name"><i class="lane-dot ' + item.color + '"></i><strong>' + item.name + '</strong><small>' + item.source + '</small></div><div class="lane-value"><b>' + item.value + '</b><small>live row</small></div><div class="lane-time"><b>' + item.context + '</b><small>no historical replay requested</small></div><p class="lane-meaning">' + item.meaning + '</p></div>').join("") + '<div class="lane-method"><b>Why the live map is empty</b><span>Discovery used one token-screener call. It returns candidate-level fields, not wallet addresses or transfer edges. The app will only draw fish after those separate endpoint responses exist.</span></div>';
      $(".atlas-badge").textContent = fixture.symbol + " · " + chainLabel(fixture.chain) + " · " + (fixture.isCached ? "CACHED NANSEN" : "LIVE NANSEN");
      $(".atlas-flow")?.setAttribute("aria-label", (fixture.isCached ? "Cached Nansen" : "Live Nansen") + " aggregate fields for " + fixture.symbol + " on " + chainLabel(fixture.chain));
      bindLaneRows(fixture);
      return;
    }
    const metrics = fixture.metrics;
    const smartWindow = seriesWindow(fixture.smartSeries);
    const whaleWindow = seriesWindow(fixture.whaleSeries);
    const rangeText = (window) => window.from ? formatObservedDate(window.from) + " to " + formatObservedDate(window.to) : "No hourly buckets saved";
    const holdingContext = (series, window) => {
      if (series.length < 2) return "No hourly holder-value history saved";
      const delta = numeric(series[series.length - 1].value_usd) - numeric(series[0].value_usd);
      return "Holder value " + (delta >= 0 ? "rose " : "fell ") + formatMoney(Math.abs(delta)) + " across " + window.count + " hourly buckets";
    };
    const rows = [
      { color: "cyan", name: "Smart-money cohort", value: formatMoney(metrics.smartNet, true), direction: metrics.smartNet >= 0 ? "net inflow" : "net outflow", source: "Flow Intelligence", window: "7d aggregate", context: holdingContext(fixture.smartSeries, smartWindow), meaning: "Nansen-labelled smart-trader cohort. Positive means more inflow than outflow in this provider window." },
      { color: "amber", name: "Whale cohort", value: formatMoney(metrics.whaleNet, true), direction: metrics.whaleNet >= 0 ? "net inflow" : "net outflow", source: "Flow Intelligence", window: "7d aggregate", context: holdingContext(fixture.whaleSeries, whaleWindow), meaning: "Separate whale-labelled cohort. It can disagree with smart money; disagreement is the signal to inspect." },
      { color: "violet", name: "Fresh-wallet cohort", value: formatMoney(metrics.freshNet, true), direction: metrics.freshNet >= 0 ? "net inflow" : "net outflow", source: "Flow Intelligence", window: "7d aggregate", context: "No wallet count was returned in this fixture", meaning: "New-wallet pressure is context, not proof of informed buying or selling." },
      { color: "coral", name: "Exchange cohort", value: formatMoney(metrics.exchangeNet, true), direction: metrics.exchangeNet >= 0 ? "net inflow" : "net outflow", source: "Flow Intelligence", window: "7d aggregate", context: "No hourly exchange series was saved", meaning: "Exchange-labelled movement is kept apart from smart money; do not infer a rise or fall from one aggregate." }
    ];
    table.innerHTML = '<div class="lane-row lane-header"><span>LANE / SOURCE</span><span>7D OBSERVED</span><span>TIME CONTEXT</span><span>HOW TO READ IT</span></div>' + rows.map((row) => '<div class="lane-row"><div class="lane-name"><i class="lane-dot ' + row.color + '"></i><strong>' + row.name + '</strong><small>' + row.source + ' · ' + row.window + '</small></div><div class="lane-value"><b>' + row.value + '</b><small>' + row.direction + '</small></div><div class="lane-time"><b>' + row.context + '</b><small>' + (row.color === "cyan" ? rangeText(smartWindow) : row.color === "amber" ? rangeText(whaleWindow) : "Snapshot only · no intra-window trend" ) + '</small></div><p class="lane-meaning">' + row.meaning + '</p></div>').join("") + '<div class="lane-method"><b>Why the lines are not merged</b><span>Flow Intelligence answers “which labelled cohort moved?” TGM Flows answers “how did cohort holdings change hourly?” Who Bought/Sold answers “which sampled addresses traded?” Transfers answer “which addresses directly connected?” The detector keeps those questions separate.</span></div>';
    $(".atlas-badge").textContent = fixture.symbol + " · " + chainLabel(fixture.chain) + " · " + (fixture.isLive ? (fixture.isCached ? "CACHED NANSEN" : "LIVE NANSEN") : "saved Nansen snapshot");
    $(".atlas-flow")?.setAttribute("aria-label", (fixture.isLive ? (fixture.isCached ? "Cached Nansen" : "Live Nansen") : "Saved Nansen") + " flow lanes for " + fixture.symbol + " on " + chainLabel(fixture.chain));
    bindLaneRows(fixture);
    return;
  }
  const labels = $$(".atlas-column.labels b");
  const values = $$(".atlas-column.values b");
  const destinations = $$(".atlas-destinations span");
  const metrics = fixture.metrics;
  if (labels.length >= 4) {
    labels[0].textContent = "Smart money";
    labels[1].textContent = "Whale lane";
    labels[2].textContent = "Exchange lane";
    labels[3].textContent = "Fresh wallets";
  }
  if (values.length >= 4) {
    values[0].textContent = formatMoney(metrics.smartNet, true);
    values[1].textContent = formatMoney(metrics.whaleNet, true);
    values[2].textContent = formatMoney(metrics.exchangeNet, true);
    values[3].textContent = formatMoney(metrics.freshNet, true);
  }
  const transferLabels = fixture.transfers.map((row) => row.to_address_label || row.transaction_type).filter(Boolean);
  destinations.forEach((destination, index) => {
    destination.textContent = transferLabels[index] || ["DEX / router", "Cold storage", "Exchange port", "Unknown"][index];
  });
  $(".atlas-badge").textContent = fixture.symbol + " · 7D FIXTURE";
  $(".atlas-flow").setAttribute("aria-label", "Fixture flow lanes for " + fixture.symbol + " on " + chainLabel(fixture.chain));
}

function updateAtlas(fixture) {
  const table = $("#laneTable");
  if (!table) return;
  if (state.investigationBusy) {
    const title = state.investigationTitle || "Analyzing selected token";
    const text = state.investigationText || "Comparing the selected evidence across the investigation views.";
    table.innerHTML = '<div class="lane-analyzing"><span class="lane-analyzing-pulse" aria-hidden="true"></span><div><strong>' + escapeFlowText(title) + '</strong><p>' + escapeFlowText(text) + '</p><small>Flow lanes are being refreshed. Missing evidence is not treated as zero activity.</small></div></div>';
    $("#flowLaneDetail").innerHTML = '<div class="flow-detail-waiting"><strong>Flow atlas is analyzing</strong><span>The selected token is being compared across provider lanes. This view will stay here when the request finishes.</span></div>';
    $(".atlas-badge").textContent = fixture.symbol + " · ANALYZING";
    return;
  }
  const rows = flowLaneDefinitions(fixture);
  table.innerHTML = '<div class="lane-row lane-header"><span>LANE / SOURCE</span><span>7D OBSERVED</span><span>TIME CONTEXT</span><span>HOW TO READ IT</span></div>' + rows.map((row, index) => '<div class="lane-row" data-lane-index="' + index + '"><div class="lane-name"><i class="lane-dot ' + row.color + '"></i><strong>' + escapeFlowText(row.name) + '</strong><small>' + escapeFlowText(row.source + " · " + row.window) + '</small></div><div class="lane-value"><b>' + escapeFlowText(row.value) + '</b><small>' + escapeFlowText(row.direction) + '</small></div><div class="lane-time"><b>' + escapeFlowText(row.context) + '</b><small>' + escapeFlowText(row.range?.from ? formatObservedDate(row.range.from) + " to " + formatObservedDate(row.range.to) : "Snapshot only · no hourly trend") + '</small></div><p class="lane-meaning">' + escapeFlowText(row.meaning) + '</p></div>').join("") + '<div class="lane-method"><b>Why the lanes stay separate</b><span>Flow Intelligence gives the signed seven-day cohort aggregate. TGM Flows gives hourly holder-value context. Who Bought/Sold gives sampled trade rows. Transfers give observed routes. These are different questions and are never added together.</span></div>';
  $(".atlas-badge").textContent = fixture.symbol + " · " + chainLabel(fixture.chain) + " · " + (fixture.isLive ? (fixture.isCached ? "CACHED NANSEN" : "LIVE NANSEN") : "saved Nansen snapshot");
  $(".atlas-flow")?.setAttribute("aria-label", (fixture.isLive ? "Live Nansen" : "Saved Nansen") + " flow atlas for " + fixture.symbol + " on " + chainLabel(fixture.chain));
  bindLaneRows(fixture);
  renderFlowLaneDetail(fixture, 0);
}

function updateFixtureChrome(fixture) {
  const metrics = fixture.metrics;
  const cards = $$(".metric-card");
  if (fixture.isLive && !fixture.hasWalletEvidence) {
    const row = fixture.screener;
    const labels = [
      ["↗", "SCREENED NET FLOW", "Token-level netflow from the live screener row"],
      ["⇄", "PRICE CONTEXT", "Used for the separate divergence check"],
      ["◌", "TRADERS", "Trader count returned by the screener"],
      ["◈", "LIVE CASES", "Distinct aggregate checks from this row"]
    ];
    const values = [formatMoney(row.netflowUsd, true), (numeric(row.priceChange) >= 0 ? "+" : "") + numeric(row.priceChange).toFixed(2) + "%", String(row.traders || "—"), String(fixture.cases.length).padStart(2, "0")];
    cards.forEach((card, index) => {
      const label = card.querySelector(".metric-label");
      const value = card.querySelector(":scope > strong");
      const sub = card.querySelector(".metric-sub");
      if (label) label.innerHTML = '<span class="metric-icon">' + labels[index][0] + "</span> " + labels[index][1] + ' <span class="info-dot" title="' + labels[index][2] + '">i</span>';
      if (value) value.textContent = values[index];
      if (sub) { sub.className = "metric-sub muted"; sub.innerHTML = labels[index][2] + "<small>one live screener response</small>"; }
    });
    $(".wallet-dots").innerHTML = "";
    $(".cluster-bars").innerHTML = fixture.cases.map((item) => '<span style="height:' + scoreCase(item) + '%"></span>').join("") + "<b>LIVE REVIEW STRENGTH</b>";
    if ($(".coverage-ring")) $(".coverage-ring").textContent = String(Math.round(fixture.cases.reduce((sum, item) => sum + scoreCase(item), 0) / fixture.cases.length));
    if ($(".coverage-mini b")) $(".coverage-mini b").textContent = "Live";
    $(".observed-time, #observedTime").textContent = "received " + formatObservedDate(fixture.fetchedAt);
    $(".map-corner-label.top-left b").textContent = fixture.chain.toUpperCase() + " · " + fixture.symbol;
    $(".map-corner-label.bottom-right").innerHTML = (fixture.isCached ? "CACHED NANSEN" : "LIVE NANSEN") + "<br /><b>AGGREGATE ONLY · NO WALLET GRAPH</b>";
    $(".annotation-cluster span:last-child").textContent = "wallet graph not requested";
    $("#oceanCanvas").setAttribute("aria-label", "Live aggregate evidence view for " + fixture.symbol + " on " + chainLabel(fixture.chain) + ". Wallet graph unavailable until wallet endpoints are requested.");
    $(".mode-badge").innerHTML = '<span class="pulse-dot"></span> ' + fixtureSourceLabel(fixture);
    updateAtlas(fixture);
    return;
  }
  if (cards.length >= 4) {
    const labels = [
      ["↗", "SMART-MONEY NET FLOW", "Provider-labelled smart-trader lane"],
      ["↕", "WHALE NET FLOW", "Separate provider cohort"],
      ["◌", "TRACKED WALLETS", "Saved buyer, seller and transfer addresses"],
      ["◇", "CANDIDATE SIGNALS", "Review lanes generated from saved evidence"]
    ];
    const values = [
      formatMoney(metrics.smartNet, true),
      formatMoney(metrics.whaleNet, true),
      String(fixture.wallets.length),
      String(fixture.cases.length).padStart(2, "0")
    ];
    cards.forEach((card, index) => {
      const label = card.querySelector(".metric-label");
      const value = card.querySelector(":scope > strong");
      const sub = card.querySelector(".metric-sub");
      if (label) label.innerHTML = '<span class="metric-icon">' + labels[index][0] + "</span> " + labels[index][1] + ' <span class="info-dot" title="' + labels[index][2] + '">i</span>';
      if (value) value.textContent = values[index];
      if (sub) {
        sub.className = "metric-sub " + (index === 0 ? "positive" : index === 3 ? "violet-text" : "muted");
        sub.innerHTML = labels[index][2] + "<small>" + (index === 2 ? metrics.holders.toLocaleString("en-US") + " total holders" : "7-day observed snapshot") + "</small>";
      }
    });
  }
  const flowLabels = [
    ["SMART MONEY", "Provider-labelled smart-trader lane", formatMoney(metrics.smartNet, true)],
    ["WHALE FLOW", "Separate provider cohort", formatMoney(metrics.whaleNet, true)],
    ["FRESH WALLETS", "Provider-labelled fresh-wallet lane", formatMoney(metrics.freshNet, true)],
    ["EXCHANGE FLOW", "Exchange-labelled lane kept separate", formatMoney(metrics.exchangeNet, true)]
  ];
  cards.forEach((card, index) => {
    if (!flowLabels[index]) return;
    const label = card.querySelector(".metric-label");
    const value = card.querySelector(":scope > strong");
    const sub = card.querySelector(".metric-sub");
    if (label) label.innerHTML = '<span class="metric-icon">' + ["↗", "↕", "◌", "◇"][index] + "</span> " + flowLabels[index][0] + ' <span class="info-dot" title="' + flowLabels[index][1] + '">i</span>';
    if (value) value.textContent = flowLabels[index][2];
    if (sub) {
      sub.className = "metric-sub " + (index === 0 ? "positive" : index === 3 ? "violet-text" : "muted");
      sub.innerHTML = flowLabels[index][1] + "<small>" + (index === 2 ? metrics.holders.toLocaleString("en-US") + " total holders" : "7-day observed snapshot") + "</small>";
    }
  });
  const shortFlowSub = ["7-day smart-money lane", "7-day whale lane", "7-day fresh-wallet lane", "7-day exchange lane"];
  cards.forEach((card, index) => {
    const sub = card.querySelector(".metric-sub");
    if (sub && shortFlowSub[index]) sub.innerHTML = shortFlowSub[index] + "<small>" + (index === 2 ? metrics.holders.toLocaleString("en-US") + " total holders" : "observed snapshot") + "</small>";
  });
  $(".wallet-dots").innerHTML = fixture.wallets.slice(0, 18).map(() => "<i></i>").join("");
  const scores = fixture.cases.map((item) => scoreCase(item));
  $(".cluster-bars").innerHTML = scores.slice(0, 3).map((score) => '<span style="height:' + score + '%"></span>').join("") + "<b>REVIEW STRENGTH</b>";
  if ($(".coverage-ring")) $(".coverage-ring").textContent = String(Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length));
  if ($(".coverage-mini b")) $(".coverage-mini b").textContent = "Fixture";
  $(".observed-time, #observedTime").textContent = formatObservedDate(fixture.latestEvent);
  $(".map-corner-label.top-left b").textContent = fixture.chain.toUpperCase() + " · " + fixture.symbol;
  $(".map-corner-label.bottom-right").innerHTML = (fixture.isCached ? "CACHED NANSEN " : fixture.isLive ? "LIVE NANSEN " : "SAVED ") + fixture.chain.toUpperCase() + "<br /><b>GRAPH LAYOUT · NOT GEOGRAPHIC</b>";
  $(".annotation-cluster span:last-child").textContent = "pattern hub";
  $("#oceanCanvas").setAttribute("aria-label", "Interactive " + fixture.symbol + " wallet evidence map for " + chainLabel(fixture.chain) + ". Select a case or wallet to inspect evidence.");
  $(".mode-badge").innerHTML = '<span class="pulse-dot"></span> ' + fixtureSourceLabel(fixture);
  setSparkline(".cyan-spark", fixture.smartSeries);
  setSparkline(".coral-spark", fixture.whaleSeries);
  updateAtlas(fixture);
}

function selectFixture(key) {
  const fixture = fixtureRecords.find((candidate) => candidate.key === key);
  if (!fixture) return;
  state.activeKey = fixture.key;
  state.activeFixture = fixture;
  state.selectedId = fixture.cases[0].id;
  state.excluded = null;
  state.selectedWallet = null;
  /*
  if (state.activeFixture) {
    const details = item.memberDetails || [];
    $$(".member-chip").forEach((button) => {
      const index = Number(button.dataset.memberIndex);
      const detail = details[index];
      button.classList.toggle("selected", state.selectedWallet === index);
      button.title = detail ? (detail.role + " · " + compactAddress(detail.address)) : "Highlight this wallet";
      const replacement = button.cloneNode(true);
      replacement.addEventListener("click", () => {
        state.selectedWallet = index;
        renderEvidence({ resetReveal: false });
        drawOcean();
        const selected = details[index];
        updateMapNarrative("wallet", selected);
        showToast("Highlighted " + (selected ? selected.role : "wallet") + ". The map ring shows the selected address.");
      });
      button.replaceWith(replacement);
    });
    const selectedNote = $("#walletSelectionNote");
    const selectedDetail = details[state.selectedWallet];
    if (selectedNote) selectedNote.textContent = selectedDetail ? "Selected: " + selectedDetail.role + " · " + compactAddress(selectedDetail.address) : "Click a wallet to highlight it in the map and see its role.";
  }
  if (options.resetReveal !== false) {
    state.revealed = false;
    state.revealStage = "ready";
    state.revealProgress = 0;
  }
  updateInvestigationUI();
  */
  state.revealStage = "ready";
  state.revealProgress = 0;
  stopReplay();
  cases = fixture.cases;
  renderFixtureOptions({ resetSearch: true });
  updateFixtureChrome(fixture);
  renderCaseList();
  renderEvidence();
  drawOcean();
  showToast(fixtureLoadMessage(fixture));
}

async function loadFixtures() {
  const liveSession = readLiveDiscoveryCache();
  if (liveSession) {
    const sessionRecords = mergeLiveDiscoveryRows(liveSession.data).map((fixture) => {
      fixture.isSessionCache = true;
      fixture.fetchedAt = liveSession.fetched_at || liveSession.saved_at || fixture.fetchedAt;
      fixture.latestEvent = fixture.fetchedAt;
      return restoreLiveEvidenceCache(fixture);
    });
    if (sessionRecords.length) {
      fixtureRecords = sessionRecords;
      state.discoveryChains = Array.isArray(liveSession.chains) && liveSession.chains.length ? liveSession.chains : state.discoveryChains;
      state.discoveryMode = "session";
      state.liveDiscoveryLoaded = true;
      if ($("#liveDataButton")) $("#liveDataButton").innerHTML = '<span class="live-dot"></span> Refresh live data';
      const discoveryCard = [...document.querySelectorAll(".coverage-card")].find((card) => card.querySelector("h3")?.textContent === "Token discovery");
      if (discoveryCard) {
        discoveryCard.querySelector(".lane-state").textContent = "LAST LIVE SESSION";
        discoveryCard.querySelector("p").textContent = `${sessionRecords.length} rows from the last live Nansen discovery session are available locally. Refresh live data only when you choose to spend another provider call.`;
      }
      renderFixtureOptions();
      selectFixture(sessionRecords[0].key);
      return;
    }
  }
  const [manifestResponse, discoveryResponse] = await Promise.all([
    fetch("/fixtures/nansen/raw/manifest.json", { cache: "no-store" }),
    fetch("/fixtures/nansen/raw/discovery.json", { cache: "no-store" }).catch(() => null)
  ]);
  const manifest = manifestResponse.ok ? await manifestResponse.json() : { selected: [] };
  const entries = Array.isArray(manifest.selected) ? manifest.selected : [];
  const loaded = await Promise.all(entries.map(async (entry) => {
    try {
      const response = await fetch("/fixtures/nansen/raw/" + encodeURIComponent(entry.file), { cache: "no-store" });
      if (!response.ok) return null;
      return buildFixture(entry, await response.json());
    } catch {
      return null;
    }
  }));
  savedFixtureRecords = loaded.filter(Boolean);
  let cachedDiscoveryRecords = [];
  let cachedDiscoveryCount = 0;
  if (discoveryResponse?.ok) {
    const discovery = await discoveryResponse.json();
    const responseRows = Array.isArray(discovery?.response?.data) ? discovery.response.data : [];
    state.discoveryChains = Array.isArray(discovery?.request?.chains) ? discovery.request.chains.filter(Boolean) : [];
    cachedDiscoveryCount = responseRows.length;
    const savedKeys = new Set(savedFixtureRecords.map((fixture) => fixture.chain + ":" + fixture.tokenAddress));
    cachedDiscoveryRecords = [...new Map(responseRows
      .map(normalizeDiscoveryRow)
      .filter((row) => row.tokenAddress && !savedKeys.has(row.chain + ":" + row.tokenAddress))
      .map((row) => {
        const fixture = buildCachedDiscoveryFixture(row, discovery.fetched_at);
        return [row.chain + ":" + row.tokenAddress, fixture];
      })).values()];
  }
  fixtureRecords = demoMode ? savedFixtureRecords.concat(cachedDiscoveryRecords) : [];
  if (!demoMode) {
    savedFixtureRecords = [];
    state.discoveryChains = ["ethereum", "solana", "base", "arbitrum", "bnb"];
    cachedDiscoveryCount = 0;
  }
  const discoveryCard = [...document.querySelectorAll(".coverage-card")].find((card) => card.querySelector("h3")?.textContent === "Token discovery");
  if (discoveryCard && cachedDiscoveryCount) {
    discoveryCard.querySelector(".lane-state").textContent = "CACHED DATA";
    discoveryCard.querySelector("p").textContent = `${cachedDiscoveryCount} Nansen token-screener rows are saved locally across the discovery chains. Selecting and searching them makes no provider request.`;
  }
  if (!fixtureRecords.length) {
    renderFixtureOptions();
    const discoveryCard = [...document.querySelectorAll(".coverage-card")].find((card) => card.querySelector("h3")?.textContent === "Token discovery");
    if (discoveryCard) {
      discoveryCard.querySelector(".lane-state").textContent = "LIVE ONLY";
      discoveryCard.querySelector("p").textContent = "No private provider responses are shipped. Use Check live data to load a bounded Nansen discovery page.";
    }
    const flowCard = [...document.querySelectorAll(".coverage-card")].find((card) => card.querySelector("h3")?.textContent === "Flow intelligence");
    if (flowCard) {
      flowCard.querySelector(".lane-state").textContent = "LIVE ONLY";
      flowCard.querySelector("p").textContent = "Flow Intelligence is requested only after a live token is selected, so the published build does not ship private flow responses.";
    }
    const historyCard = [...document.querySelectorAll(".coverage-card")].find((card) => card.querySelector("h3")?.textContent === "Historical context");
    if (historyCard) {
      historyCard.querySelector(".lane-state").textContent = "NOT LOADED";
      historyCard.querySelector("p").textContent = "Historical provider responses are not included in the repository. Live results show their returned observation window.";
    }
    showNoLocalDataState();
    renderCaseList();
    renderEvidence();
    showNoLocalDataState();
    drawOcean();
    return;
  }
  state.noLocalData = false;
  renderFixtureOptions();
  selectFixture(fixtureRecords[0].key);
}

function scoreCase(item) {
  const numeric = item.evidence.map((entry) => Number.parseFloat(entry.strength)).filter(Number.isFinite);
  if (!numeric.length) return item.confidence;
  const familyAverage = numeric.reduce((sum, value) => sum + value, 0) / numeric.length;
  const familyCoverage = Math.min(8, Math.max(0, numeric.length - 1)) * 2;
  return Math.min(95, Math.round(familyAverage * 0.92 + familyCoverage));
}

function displayCaseId(item) {
  const source = state.activeFixture?.isLive ? "LIVE" : "SAVED";
  return item.id.startsWith("FIXTURE-") ? source + " · " + item.id.replace("FIXTURE-", "") : item.id;
}

function renderCaseList() {
  const list = $("#caseList");
  const visible = cases.filter((item) => state.filter === "all" || item.filter === state.filter);
  list.innerHTML = visible.map((item) => `
    <button class="case-item ${item.id === state.selectedId ? "active" : ""}" data-case-id="${item.id}">
      <div class="case-item-head"><span class="case-number">${item.number}</span><span class="case-trend ${item.trendClass}">${item.trend}</span></div>
      <div><h3>${item.title}</h3><p>${item.short}</p></div>
      <div class="case-meta"><span>${displayCaseId(item)}</span><b class="${item.confidence >= 70 ? "good" : ""}">${scoreCase(item)}% confidence</b></div>
    </button>`).join("");
  $$(".case-item").forEach((button) => button.addEventListener("click", () => selectCase(button.dataset.caseId)));
}

function bindLaneRows(fixture) {
  const table = $("#laneTable");
  if (!table) return;
  const lanes = flowLaneDefinitions(fixture);
  [...table.querySelectorAll(".lane-row:not(.lane-header)")].forEach((row, index) => {
    const laneIndex = Number(row.dataset.laneIndex ?? index);
    const lane = lanes[laneIndex];
    if (!lane) return;
    row.classList.add("lane-row-action");
    row.setAttribute("role", "button");
    row.setAttribute("tabindex", "0");
    row.setAttribute("aria-label", "Inspect " + lane.name + " in the Flow atlas");
    const activate = () => {
      if (lane.caseId && fixture.cases.some((item) => item.id === lane.caseId)) selectCase(lane.caseId, { preserveView: true });
      renderFlowLaneDetail(fixture, laneIndex);
      showToast(lane.name + " selected. Details stay in Flow lanes.");
    };
    row.addEventListener("click", activate);
    row.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); activate(); } });
  });
}

function buildEvidenceRows(item, fixture, scope) {
  if (!fixture || (fixture.isLive && !fixture.hasWalletEvidence)) return item.evidence;
  if (item.id === "FIXTURE-SMART") return [
    { icon: "+", title: "Provider smart-money flow", text: "Flow Intelligence reports " + formatMoney(fixture.metrics.smartNet, true) + " net flow from " + fixture.metrics.smartWallets + " tracked smart-money wallets.", meta: "OBSERVED · /api/v1/tgm/flow-intelligence", strength: "72%" },
    { icon: "#", title: "Buyer-connected graph", text: scope.groups.length ? scope.groups.map((group) => group.id + " = " + group.wallets.length + " wallets / " + group.edgeCount + " direct edges").join("; ") : "No buyer-connected multi-wallet component", meta: "INFERRED · /api/v1/tgm/transfers", strength: scope.groups.length ? "78%" : "42%" },
    { icon: "?", title: "Ownership evidence missing", text: "No related-wallets, entity ownership, or premium holder-label response is in this saved snapshot.", meta: "UNAVAILABLE · DO NOT MERGE GROUPS", strength: "—" }
  ];
  if (item.id === "FIXTURE-DIVERGENCE") return [
    { icon: "⇄", title: "Two provider cohorts", text: "Smart-money is " + formatMoney(fixture.metrics.smartNet, true) + " while whale flow is " + formatMoney(fixture.metrics.whaleNet, true) + ". They are compared, not merged.", meta: "OBSERVED · /api/v1/tgm/flow-intelligence", strength: fixture.metrics.whaleNet * fixture.metrics.smartNet < 0 ? "82%" : "56%" },
    { icon: "#", title: "Relevant route edges", text: scope.groups.length ? scope.groups.map((group) => group.id + " keeps " + group.wallets.length + " connected rows visible").join("; ") : "No relevant multi-wallet route group", meta: "INFERRED · /api/v1/tgm/transfers", strength: scope.groups.length ? "70%" : "42%" },
    { icon: "?", title: "Labels are not ownership", text: "Whale and smart-money labels describe provider cohorts. They do not identify one controller.", meta: "LIMITATION · COHORT RULES", strength: "—" }
  ];
  return [
    { icon: "◌", title: "Fresh-wallet aggregate", text: "Flow Intelligence reports " + formatMoney(fixture.metrics.freshNet, true) + ", but the saved response has no fresh-wallet address list.", meta: "OBSERVED · /api/v1/tgm/flow-intelligence", strength: fixture.metrics.freshNet !== 0 ? "65%" : "—" },
    { icon: "#", title: "Fresh-wallet graph scope", text: scope.wallets.length ? scope.wallets.length + " fresh-labelled rows remain visible." : "No fresh-labelled rows were returned, so no fish are drawn.", meta: "UNAVAILABLE · ADDRESS LABELS", strength: "—" },
    { icon: "?", title: "Do not reuse smart-money fish", text: "Buyer rows are not silently reused here. This case needs a fresh-wallet address response before a relationship can be shown.", meta: "LIMITATION · DIFFERENT SIGNAL", strength: "—" }
  ];
}

function renderEvidence(options = {}) {
  const item = selectedCase();
  const score = scoreCase(item);
  const scope = state.activeFixture ? signalScope(state.activeFixture, item) : null;
  $("#evidenceTitle").textContent = item.title;
  $("#evidenceStatus").textContent = item.status;
  $("#evidenceStatus").className = `status-pill ${item.statusClass}`;
  $("#caseId").textContent = displayCaseId(item) + " · " + (state.activeFixture?.isLive ? (state.activeFixture.liveStatus === "partial_live" ? "partial live evidence" : state.activeFixture.liveCalls ? "live token evidence" : "live discovery") : item.version === "fixture" ? "saved snapshot" : item.version);
  let finding = item.finding;
  if (state.activeFixture && (!state.activeFixture.isLive || state.activeFixture.hasWalletEvidence)) {
    const groupText = scope.groups.length ? scope.groups.map((group) => group.id + " has " + group.wallets.length + " wallets linked by " + group.edgeCount + " saved transfer edges").join("; ") : "no matching multi-wallet transfer component";
    finding = item.id === "FIXTURE-SMART"
      ? "Observed provider lane: " + state.activeFixture.metrics.smartWallets + " smart-money wallets show " + formatMoney(state.activeFixture.metrics.smartNet, true) + " net flow. This map then keeps only buyer rows and their transfer-connected partners: " + groupText + "."
      : item.id === "FIXTURE-DIVERGENCE"
        ? "This view compares separate cohorts: smart-money " + formatMoney(state.activeFixture.metrics.smartNet, true) + " versus whale " + formatMoney(state.activeFixture.metrics.whaleNet, true) + ". The map does not merge them; it only shows saved transfer edges between relevant rows."
        : "Fresh-wallet flow is " + formatMoney(state.activeFixture.metrics.freshNet, true) + ", but the saved response contains " + (scope.wallets.length ? scope.wallets.length + " fresh-labelled wallet rows" : "no fresh-labelled wallet rows") + ". " + scope.reason;
  }
  $("#findingText").textContent = finding;
  $("#confidenceValue").textContent = `${score}%`;
  $("#confidenceFill").style.width = `${score}%`;
  $("#confidenceDescriptor").textContent = item.confidenceDescriptor;
  $("#exposureValue").textContent = item.exposure;
  $("#exposureSub").textContent = item.exposureSub;
  $("#flowValue").textContent = item.flow;
  $("#evidenceCount").textContent = `${buildEvidenceRows(item, state.activeFixture, scope).filter((e) => Number.isFinite(Number.parseFloat(e.strength))).length} observed families`;
  $("#evidenceList").innerHTML = buildEvidenceRows(item, state.activeFixture, scope).map((e) => `<div class="evidence-row"><span class="evidence-symbol">${e.icon}</span><div><strong>${e.title} <span class="evidence-strength">${e.strength}</span></strong><p>${e.text}</p><small>${e.meta}</small></div></div>`).join("");
  $("#counterEvidence").textContent = item.counter;
  if (state.activeFixture && item.id === "FIXTURE-SMART") {
    $("#counterEvidence").textContent = "A direct transfer edge can represent routing, consolidation, or a shared service. The fixture does not include related-wallets, entity ownership, or premium labels, so each graph component remains an inferred behavior group only.";
  }
  const visibleDetails = scope ? scope.wallets : [];
  const visibleMembers = state.activeFixture ? visibleDetails.map((wallet) => compactAddress(wallet.address)) : item.members;
  const walletHeading = $(".wallet-section h3");
  if (walletHeading) walletHeading.textContent = visibleDetails.length ? "Wallets in this signal" : "Wallet-level evidence";
  const showAllWallets = $("#showAllWallets");
  if (showAllWallets) {
    showAllWallets.hidden = !visibleDetails.length;
    showAllWallets.textContent = visibleDetails.length ? "View all " + visibleDetails.length + " ↗" : "Wallet addresses not loaded";
  }
  $("#memberGrid").innerHTML = visibleMembers.slice(0, 8).map((member, index) => `<button class="member-chip ${state.excluded === index ? "excluded" : ""}" data-member-index="${index}">${member}</button>`).join("");
  $("#excludedNote").hidden = state.excluded === null;
  $("#excludedNote").textContent = state.excluded === null ? "" : `Alternate hypothesis: ${item.members[state.excluded]} excluded locally · source data unchanged`;
  $$(".member-chip").forEach((button) => button.addEventListener("click", () => { state.excluded = Number(button.dataset.memberIndex); renderEvidence(); drawOcean(); showToast("Local alternate hypothesis updated — the source observation is unchanged."); }));
  if (state.activeFixture) {
    const details = visibleDetails;
    if (!details.length) {
      const emptyNote = $("#walletSelectionNote");
      if (emptyNote) emptyNote.textContent = scope.reason;
      $("#oceanCanvas").setAttribute("aria-label", "No wallet-level graph for " + state.activeFixture.symbol + ". " + scope.reason);
    }
    $$(".member-chip").forEach((button) => {
      const index = Number(button.dataset.memberIndex);
      const detail = details[index];
      button.title = detail ? (detail.role + " · " + compactAddress(detail.address)) : "Highlight this wallet";
      const replacement = button.cloneNode(true);
      replacement.addEventListener("click", () => {
        state.selectedWallet = index;
        renderEvidence({ resetReveal: false });
        drawOcean();
        const selected = details[index];
        updateMapNarrative("wallet", selected);
        showToast("Highlighted " + (selected ? selected.role : "wallet") + ". The map ring shows the selected address.");
      });
      button.replaceWith(replacement);
    });
    const selectedNote = $("#walletSelectionNote");
    const selectedDetail = details[state.selectedWallet];
    if (selectedNote) selectedNote.textContent = selectedDetail ? "Selected: " + selectedDetail.role + " · " + compactAddress(selectedDetail.address) : "Click a wallet to highlight it in the map and see its role.";
  }
  if (options.resetReveal !== false) {
    state.revealed = false;
    state.revealStage = "ready";
    state.revealProgress = 0;
  }
  updateInvestigationUI();
  $("#investigateButton").innerHTML = `<span class="sonar-mini">◉</span> Investigate school`;
  updateInvestigationUI();
  if (state.activeFixture) {
    $("#caseId").textContent = displayCaseId(item) + " · " + (state.activeFixture?.isLive ? (state.activeFixture.liveStatus === "partial_live" ? "partial live evidence" : state.activeFixture.liveCalls ? "live token evidence" : "live discovery") : item.version === "fixture" ? "saved snapshot" : item.version);
    const provenanceText = $(".provenance span:nth-child(2)");
    if (!visibleDetails.length) {
      const emptyNote = $("#walletSelectionNote");
      if (emptyNote) emptyNote.textContent = scope.reason;
    }
    if (provenanceText) provenanceText.innerHTML = "<b>Data provenance</b><br />" + (state.activeFixture.isCached ? "Cached Nansen discovery · no live request" : state.activeFixture.isLive ? (state.activeFixture.liveCalls ? "Live Nansen token evidence · " + state.activeFixture.liveCalls + " endpoint responses" : "Live Nansen discovery · one screener request") : "Saved Nansen snapshot · no live request");
  }
}

function selectCase(id, options = {}) {
  state.selectedId = id;
  state.excluded = null;
  state.selectedWallet = null;
  renderCaseList();
  renderEvidence();
  drawOcean();
  if (!options.preserveView) document.querySelector(".evidence-panel")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function updateGlobalInvestigationStatus() {
  const status = $("#globalInvestigationStatus");
  if (!status) return;
  const tracing = state.revealStage === "tracing";
  const visible = state.investigationBusy || tracing;
  status.hidden = !visible;
  status.classList.toggle("active", visible);
  const symbol = state.activeFixture?.symbol || "selected token";
  const title = $("#globalInvestigationTitle");
  const text = $("#globalInvestigationText");
  const step = $("#globalInvestigationStep");
  if (title) title.textContent = state.investigationTitle || (tracing ? `Analyzing ${symbol}` : "Analyzing selected token");
  if (text) text.textContent = state.investigationText || "Comparing timing, direction, and transfer paths across all views.";
  if (step) step.textContent = state.investigationStep || (tracing ? "BEHAVIOR TRACE · ALL VIEWS" : "ALL VIEWS · LIVE");
}

function setInvestigationBusy(busy, title = "", text = "", step = "") {
  state.investigationBusy = Boolean(busy);
  state.investigationTitle = busy ? title : "";
  state.investigationText = busy ? text : "";
  state.investigationStep = busy ? step : "";
  updateGlobalInvestigationStatus();
  if (state.activeFixture) updateAtlas(state.activeFixture);
  drawOcean();
}

function updateInvestigationUI() {
  if (state.activeFixture) $$(".member-chip").forEach((button) => button.classList.toggle("selected", Number(button.dataset.memberIndex) === state.selectedWallet));
  const stage = $("#investigationStage");
  const counter = $("#stageCounter");
  const narrative = $("#mapNarrative");
  const button = $("#investigateButton");
  const steps = $$("[data-guide-step]");
  const stages = {
    ready: { label: "Ready to trace", counter: "1 / 3", text: "The map is a visual aid. Nothing is grouped until you ask the app to investigate the selected signal." },
    tracing: { label: "Tracing observed behavior", counter: "1 / 3", text: "Small fish are moving along saved wallet and transfer evidence. This is the observed part of the investigation." },
    grouped: { label: "Pattern-matched herd formed", counter: "2 / 3", text: "The highlighted wallets share signal traits in this fixture: direction, timing buckets, and route context. The whale shape is a visual summary, not a new wallet." },
    explained: { label: "Evidence explained", counter: "3 / 3", text: "Review the evidence drawer for why the group was formed and what could explain it another way." }
  };
  const fixture = state.activeFixture;
  const liveAggregate = Boolean(fixture?.isLive && !fixture?.hasWalletEvidence);
  const scope = fixture ? signalScope(fixture, selectedCase()) : { groups: [], wallets: [], ungroupedCount: 0, reason: "No asset is selected." };
  const groups = scope.groups || [];
  const ungrouped = scope.ungroupedCount || 0;
  const groupSummary = groups.length ? groups.map((group) => group.id + " (" + group.wallets.length + ")").join(" · ") : "no multi-wallet component";
  const dynamicStages = {
    ready: { label: state.noLocalData ? "Live data required" : "Ready to trace", counter: "1 / 3", text: state.noLocalData ? "No private provider data is included. Load one bounded Nansen discovery page to begin." : liveAggregate ? scope.reason : scope.reason + " Trace this signal to move only relevant wallets toward their own inferred group." },
    tracing: { label: "Tracing selected evidence", counter: "1 / 3", text: liveAggregate ? "This live candidate has no wallet addresses yet, so the map stays empty and no fake movement is added." : "The map is animating only the wallet rows relevant to this signal. No group is being created from visual proximity." },
    grouped: { label: liveAggregate ? "Aggregate review only" : "Separate groups formed", counter: "2 / 3", text: liveAggregate ? "The screener row is an aggregate candidate. Wallet-level grouping needs a separate token investigation." : groups.length ? groupSummary + " formed from direct transfer connectivity. " + ungrouped + " sampled wallet" + (ungrouped === 1 ? " remains" : "s remain") + " outside because no saved edge connects it." : scope.reason },
    explained: { label: "Evidence explained", counter: "3 / 3", text: liveAggregate ? scope.reason : scope.reason + " Flow Intelligence validates cohort direction, but it does not prove that connected wallets share an owner." }
  };
  const current = dynamicStages[state.revealStage] || stages.ready;
  if (stage) stage.textContent = current.label;
  if (counter) counter.textContent = current.counter;
  if (narrative) narrative.textContent = current.text;
  steps.forEach((step) => {
    const key = step.dataset.guideStep;
    step.classList.toggle("current", (state.revealStage === "tracing" && key === "trace") || (state.revealStage === "grouped" && key === "group") || (state.revealStage === "explained" && key === "explain"));
    step.classList.toggle("done", (state.revealStage === "grouped" && key === "trace") || (state.revealStage === "explained" && (key === "trace" || key === "group")));
  });
  if (button) {
    const labels = {
      ready: state.noLocalData ? '<span class="sonar-mini">◉</span> Check live data' : liveAggregate ? '<span class="sonar-mini">◉</span> Load wallet evidence' : '<span class="sonar-mini">◉</span> Trace this signal',
      tracing: '<span class="sonar-mini">◌</span> Tracing behavior...',
      grouped: '<span class="sonar-mini">◉</span> Explain this herd',
      explained: '<span class="sonar-mini">↺</span> Reset grouping'
    };
    button.innerHTML = labels[state.revealStage] || labels.ready;
    button.disabled = state.revealStage === "tracing";
  }
  updateGlobalInvestigationStatus();
  updatePlayButton();
}

function updateMapNarrative(kind, detail) {
  const note = $("#walletSelectionNote");
  if (kind === "wallet" && note && detail) note.textContent = "Selected: " + detail.role + " · " + compactAddress(detail.address) + ". Its ring is highlighted in the signal map.";
  if (kind === "replay") {
    const narrative = $("#mapNarrative");
    if (narrative && state.revealStage === "ready") narrative.textContent = "Replay is moving through the saved observation window. Press Trace this signal when you see a behavior worth investigating.";
  }
}

function updatePlayButton() {
  const button = $("#playButton");
  if (!button) return;
  button.setAttribute("aria-label", state.playing ? "Pause money-flow replay" : "Play money-flow replay");
  button.title = state.playing ? "Pause the money-flow replay" : "Play the money-flow replay";
  const icon = $("#playIcon");
  if (icon) icon.textContent = state.playing ? "Ⅱ" : "▶";
}

function stopReplay() {
  if (state.playTimer) window.clearInterval(state.playTimer);
  state.playTimer = null;
  state.playing = false;
  updatePlayButton();
}

function stepReplay() {
  stopReplay();
  const next = state.timeline >= 100 ? 0 : Math.min(100, state.timeline + 8);
  state.motionPhase += 1.2;
  $("#timeline").value = next;
  updateTimeline(next);
  updateMapNarrative("replay");
  showToast("Replay advanced one saved observation window.");
}

function drawOcean() {
  const canvas = $("#oceanCanvas");
  canvas.addEventListener("mousemove", (event) => {
    event.stopImmediatePropagation();
    if (!state.activeFixture) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left, y = event.clientY - rect.top;
    const node = getFixtureNodes(rect.width, rect.height).find((candidate) => Math.hypot(candidate.x - x, candidate.y - y) < candidate.r + 8);
    const card = $("#mapHoverCard");
    if (!node) { card.classList.remove("show"); return; }
    card.innerHTML = "<small>" + node.label.toUpperCase() + "</small><b>" + (node.address ? compactAddress(node.address) : "SIGNAL HUB") + "</b><span>" + (node.address ? "Click to inspect this wallet's role." : "Pattern comparison anchor") + "</span>";
    card.style.left = Math.min(rect.width - 165, x + 12) + "px";
    card.style.top = Math.max(10, y - 55) + "px";
    card.classList.add("show");
  }, true);
  canvas.addEventListener("click", (event) => {
    event.stopImmediatePropagation();
    if (!state.activeFixture) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left, y = event.clientY - rect.top;
    const node = getFixtureNodes(rect.width, rect.height).find((candidate) => Math.hypot(candidate.x - x, candidate.y - y) < candidate.r + 10);
    if (!node || !node.address) return;
    const index = signalScope(state.activeFixture, selectedCase()).wallets.findIndex((wallet) => wallet.address === node.address);
    if (index < 0) return;
    state.selectedWallet = index;
    renderEvidence({ resetReveal: false });
    drawOcean();
    const selected = signalScope(state.activeFixture, selectedCase()).wallets[index];
    updateMapNarrative("wallet", selected);
    showToast("Selected " + selected.role + ". The drawer now explains this wallet.");
  }, true);
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  if (rect.width < 20 || rect.height < 20) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.floor(rect.width * dpr)); canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  const ctx = canvas.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const w = rect.width, h = rect.height, item = selectedCase();
  const gradient = ctx.createLinearGradient(0, 0, w, h); gradient.addColorStop(0, "#0b2938"); gradient.addColorStop(.55, "#08202e"); gradient.addColorStop(1, "#071822"); ctx.fillStyle = gradient; ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = .18; for (let y = -20; y < h + 40; y += 31) { ctx.beginPath(); ctx.moveTo(0, y); for (let x = 0; x < w + 25; x += 25) ctx.lineTo(x, y + Math.sin(x * .018 + y * .03) * 4); ctx.strokeStyle = "#3c9aa0"; ctx.lineWidth = .45; ctx.stroke(); } ctx.globalAlpha = 1;
  drawCurrent(ctx, w, h, .21, .39, "#43e0d2", .37); drawCurrent(ctx, w, h, .65, .22, "#43e0d2", .23); drawCurrent(ctx, w, h, .34, .73, "#f47e70", .2);
  drawPorts(ctx, w, h);
  const nodes = state.activeFixture ? getFixtureNodes(w, h) : state.noLocalData ? [] : getNodes(w, h);
  if (!state.investigationBusy) {
    if (state.activeFixture && !nodes.length) drawMapEmpty(ctx, w, h, signalScope(state.activeFixture, item).reason);
    if (state.noLocalData) drawMapEmpty(ctx, w, h, "Select Check live data to load a real Nansen token candidate.");
  }
  const drawnLinks = new Set();
  nodes.forEach((node) => {
    const links = node.links || (node.link ? [node.link] : []);
    links.forEach((linkId) => {
      const linkKey = [node.id, linkId].sort().join("|");
      if (!drawnLinks.has(linkKey)) {
        drawnLinks.add(linkKey);
        drawLink(ctx, node, nodes.find((other) => other.id === linkId));
      }
    });
  });
  if (state.activeFixture && state.revealProgress > .62) {
    signalScope(state.activeFixture, item).groups.forEach((group, index) => {
      const groupNodes = nodes.filter((node) => node.groupId === group.id);
      drawHerdWhale(ctx, groupNodes, state.revealProgress, group, index);
    });
  }
  if (state.revealed && state.activeFixture) signalScope(state.activeFixture, item).groups.forEach((group) => drawClusterOutline(ctx, nodes.filter((node) => node.groupId === group.id), state.animation, group));
  if (state.revealed && !state.activeFixture) drawClusterOutline(ctx, nodes.filter((node) => node.cluster === 1), state.animation);
  nodes.forEach((node) => drawFish(ctx, node, node.isSelected, node.color));
  if (state.investigationBusy) drawMapAnalyzing(ctx, w, h);
}

function drawMapAnalyzing(ctx, w, h) {
  const symbol = state.activeFixture?.symbol || "SELECTED TOKEN";
  ctx.save();
  ctx.fillStyle = "rgba(5, 22, 32, .88)";
  ctx.fillRect(w * .1, h * .25, w * .8, h * .48);
  ctx.strokeStyle = "rgba(67, 224, 210, .72)";
  ctx.setLineDash([7, 5]);
  ctx.strokeRect(w * .1, h * .25, w * .8, h * .48);
  ctx.setLineDash([]);
  ctx.textAlign = "center";
  ctx.fillStyle = "#43e0d2";
  ctx.font = "600 17px DM Sans";
  ctx.fillText("ANALYZING " + String(symbol).toUpperCase(), w / 2, h * .43);
  ctx.fillStyle = "#c2d5d3";
  ctx.font = "12px DM Sans";
  ctx.fillText("Comparing Nansen evidence across the investigation views", w / 2, h * .51);
  ctx.fillStyle = "#8ea9ab";
  ctx.font = "10px DM Mono";
  ctx.fillText("Please wait · the result will appear here", w / 2, h * .59);
  ctx.restore();
}

function drawMapEmpty(ctx, w, h, reason) {
  ctx.save();
  ctx.fillStyle = "rgba(8, 25, 35, .78)";
  ctx.fillRect(w * .12, h * .28, w * .76, h * .42);
  ctx.strokeStyle = "rgba(245, 185, 91, .55)";
  ctx.setLineDash([5, 5]);
  ctx.strokeRect(w * .12, h * .28, w * .76, h * .42);
  ctx.setLineDash([]);
  ctx.textAlign = "center";
  ctx.fillStyle = "#f5b95b";
  ctx.font = "600 16px DM Sans";
  ctx.fillText("WALLET EVIDENCE NOT LOADED", w / 2, h * .43);
  ctx.fillStyle = "#b4c5c5";
  ctx.font = "12px DM Sans";
  const words = String(reason).split(" ");
  let line = "";
  let lineY = h * .51;
  words.forEach((word) => {
    const next = line ? line + " " + word : word;
    if (ctx.measureText(next).width > w * .62) { ctx.fillText(line, w / 2, lineY); line = word; lineY += 18; } else line = next;
  });
  if (line) ctx.fillText(line, w / 2, lineY);
  ctx.restore();
}

function drawCurrent(ctx, w, h, xRatio, yRatio, color, alpha) { ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = 1.2; ctx.setLineDash([2, 8]); ctx.beginPath(); ctx.moveTo(-20, h * yRatio); ctx.bezierCurveTo(w * .25, h * (yRatio - .12), w * .55, h * (yRatio + .13), w + 20, h * (yRatio - .04)); ctx.stroke(); ctx.restore(); }
function drawPorts(ctx, w, h) { const ports = [{ x: .84, y: .32, label: "DEX ROUTER" }, { x: .77, y: .72, label: "EXCHANGE" }]; ports.forEach((port) => { const x = w * port.x, y = h * port.y; ctx.save(); ctx.fillStyle = "rgba(244,126,112,.13)"; ctx.strokeStyle = "rgba(244,126,112,.65)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(x - 22, y - 22, 44, 44, 8); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#f47e70"; ctx.font = "12px DM Mono"; ctx.textAlign = "center"; ctx.fillText("▣", x, y + 4); ctx.fillStyle = "rgba(244,190,180,.65)"; ctx.font = "7px DM Mono"; ctx.fillText(port.label, x, y + 34); ctx.restore(); }); }
function getNodes(w, h) { const positions = [[.18,.23],[.25,.38],[.13,.56],[.3,.64],[.4,.24],[.47,.42],[.54,.63],[.61,.31],[.7,.5],[.58,.79],[.8,.55],[.38,.79],[.2,.77],[.72,.16],[.49,.16]]; return positions.map((pos, index) => { const cluster = index < 6 ? 1 : 0; const jitter = Math.sin(state.animation * .08 + index) * 1.2; return { id: index === 0 ? "anchor" : `node-${index}`, x: w * pos[0] + jitter, y: h * pos[1], r: index === 0 ? 9 : 4 + (index % 3), cluster, color: index === 0 ? "#f5b95b" : cluster ? "#43e0d2" : index % 3 === 0 ? "#a88df5" : "#5d9ca5", link: index === 1 ? "anchor" : index === 2 ? "node-1" : index === 4 ? "node-2" : index === 7 ? "node-6" : null, label: cluster ? "school wallet" : "wallet" }; }); }
function getFixtureNodes(w, h) {
  const fixture = state.activeFixture;
  if (!fixture) return [];
  const scope = signalScope(fixture, selectedCase());
  if (!scope.wallets.length) return [];
  const scopeWallets = new Map(scope.wallets.map((wallet) => [wallet.address, wallet]));
  const positions = [[.18, .23], [.25, .38], [.13, .56], [.3, .64], [.4, .24], [.47, .42], [.54, .63], [.61, .31], [.7, .5], [.58, .79], [.8, .55], [.38, .79], [.2, .77], [.72, .16], [.49, .16]];
  const groupCenters = [{ x: .43, y: .38 }, { x: .7, y: .58 }, { x: .28, y: .7 }, { x: .72, y: .24 }, { x: .3, y: .26 }];
  const progress = state.revealProgress;
  const walletNodes = scope.wallets.slice(0, positions.length - 1).map((wallet, index) => {
    const position = positions[index + 1];
    const cluster = Boolean(wallet.groupId);
    const group = cluster ? scope.groups.find((candidate) => candidate.id === wallet.groupId) : null;
    const groupIndex = group ? scope.groups.indexOf(group) : -1;
    const memberIndex = group ? group.wallets.findIndex((candidate) => candidate.address === wallet.address) : 0;
    const seller = wallet.direction === "seller";
    const color = wallet.isWhale ? "#f5b95b" : seller ? "#f47e70" : wallet.direction === "buyer" ? "#43e0d2" : "#a88df5";
    const jitter = Math.sin(state.motionPhase + index) * (state.playing ? 4 : 1.2);
    const center = groupCenters[Math.max(0, groupIndex) % groupCenters.length];
    const angle = group ? memberIndex / Math.max(1, group.wallets.length) * Math.PI * 2 : 0;
    const radiusX = group && group.wallets.length > 5 ? 55 : 28;
    const radiusY = group && group.wallets.length > 5 ? 34 : 22;
    const targetX = w * center.x + Math.cos(angle) * (radiusX + (memberIndex % 3) * 5);
    const targetY = h * center.y + Math.sin(angle) * (radiusY + (memberIndex % 2) * 5);
    const baseX = w * position[0] + jitter;
    const baseY = h * position[1] + Math.cos(state.motionPhase * .7 + index) * (state.playing ? 4 : 0);
    return {
      id: wallet.id,
      x: cluster ? baseX * (1 - progress) + targetX * progress : baseX,
      y: cluster ? baseY * (1 - progress) + targetY * progress : baseY,
      r: 4 + (index % 3) + (state.mapMode === "activity" ? 2 : 0),
      cluster,
      color,
      groupId: wallet.groupId,
      links: wallet.links.map((address) => scopeWallets.get(address)?.id).filter(Boolean),
      label: wallet.role,
      address: wallet.address,
      isSelected: state.selectedWallet !== null && scope.wallets[state.selectedWallet] && scope.wallets[state.selectedWallet].address === wallet.address
    };
  });
  return walletNodes;
}

function drawHerdWhale(ctx, nodes, progress, group, groupIndex = 0) {
  if (!nodes.length) return;
  const cx = nodes.reduce((sum, node) => sum + node.x, 0) / nodes.length;
  const cy = nodes.reduce((sum, node) => sum + node.y, 0) / nodes.length;
  const scale = Math.min(1, Math.max(0, (progress - .62) / .38));
  const size = Math.max(0, Math.min(1, (nodes.length - 1) / 8));
  const rx = 28 + size * 30 + scale * 8;
  const ry = 18 + size * 15 + scale * 6;
  ctx.save();
  ctx.globalAlpha = .12 + scale * .1;
  ctx.fillStyle = "#a88df5";
  ctx.strokeStyle = "rgba(203,190,255,.8)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, -.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - rx + 5, cy);
  ctx.lineTo(cx - rx - 24, cy - 17);
  ctx.lineTo(cx - rx - 20, cy + 2);
  ctx.lineTo(cx - rx - 34, cy + 15);
  ctx.lineTo(cx - rx + 1, cy + 11);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + rx * .25, cy + ry * .55);
  ctx.quadraticCurveTo(cx + rx * .35, cy + ry + 15, cx + rx * .52, cy + ry * .55);
  ctx.stroke();
  ctx.fillStyle = "#d9d2ff";
  ctx.font = "10px DM Mono";
  ctx.textAlign = "center";
  ctx.font = "9px DM Mono";
  ctx.fillText(group ? group.id : "GROUP", cx, cy + 3);
  ctx.fillText("VISUAL HERD · PATTERN-MATCHED WALLETS", cx, cy - ry - 13);
  ctx.restore();
}

function drawLink(ctx, from, to) { if (!from || !to) return; ctx.save(); ctx.globalAlpha = .48; ctx.strokeStyle = from.cluster ? "#43e0d2" : "#697c97"; ctx.lineWidth = .8; ctx.setLineDash(from.cluster ? [3, 3] : [1, 5]); ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke(); ctx.restore(); }
function drawClusterOutline(ctx, nodes, progress) { if (!nodes.length) return; const cx = nodes.reduce((s, n) => s + n.x, 0) / nodes.length, cy = nodes.reduce((s, n) => s + n.y, 0) / nodes.length; const rx = Math.max(...nodes.map((n) => Math.abs(n.x - cx))) + 30, ry = Math.max(...nodes.map((n) => Math.abs(n.y - cy))) + 27; ctx.save(); ctx.globalAlpha = Math.min(1, .3 + progress / 240); ctx.translate(cx, cy); ctx.rotate(-.09); ctx.strokeStyle = "#a88df5"; ctx.lineWidth = 1.5; ctx.setLineDash([7, 5]); ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = "rgba(168,141,245,.055)"; ctx.fill(); ctx.fillStyle = "#c5b7ff"; ctx.font = "8px DM Mono"; ctx.textAlign = "center"; ctx.fillText("PATTERN-MATCHED GROUP · INFERRED", 0, -ry - 9); ctx.restore(); }
function drawFish(ctx, node, selected, color) { ctx.save(); ctx.translate(node.x, node.y); if (selected) { ctx.globalAlpha = .2; ctx.fillStyle = color; ctx.beginPath(); ctx.arc(0, 0, node.r + 9, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; } ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(0, 0, node.r * 1.35, node.r * .75, 0, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.moveTo(node.r * 1.15, 0); ctx.lineTo(node.r * 2.1, -node.r * .7); ctx.lineTo(node.r * 2.1, node.r * .7); ctx.closePath(); ctx.fill(); ctx.fillStyle = "#08202e"; ctx.beginPath(); ctx.arc(-node.r * .65, -node.r * .15, 1.1, 0, Math.PI * 2); ctx.fill(); if (selected) { ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0,0,node.r + 5,0,Math.PI*2); ctx.stroke(); } ctx.restore(); }

function animateReveal() {
  if (state.revealTimer) window.clearInterval(state.revealTimer);
  state.revealTimer = window.setInterval(() => {
    state.animation += 5;
    state.revealProgress = Math.min(1, state.animation / 100);
    drawOcean();
    updateInvestigationUI();
    if (state.animation >= 100) {
      window.clearInterval(state.revealTimer);
      state.revealTimer = null;
      state.revealStage = "grouped";
      setInvestigationBusy(false);
      updateInvestigationUI();
      window.setTimeout(() => {
        if (state.revealed) {
          state.revealStage = "explained";
          updateInvestigationUI();
        }
      }, 450);
    }
  }, 60);
}
function investigate() { state.revealed = true; state.animation = 0; $("#investigateButton").innerHTML = `<span class="sonar-mini">◉</span> School revealed · inspect evidence`; showToast("Sonar complete. The outline is an inferred cluster, not an ownership claim."); if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { state.animation = 100; drawOcean(); } else { cancelAnimationFrame(state.raf); animateReveal(); } }

async function loadLiveTokenEvidence() {
  const source = state.activeFixture;
  if (!source || !source.isLive || source.hasWalletEvidence || source.liveEvidenceAttempted) return;
  source.liveEvidenceAttempted = true;
  const button = $("#investigateButton");
  setInvestigationBusy(true, "Investigating " + source.symbol + " on " + chainLabel(source.chain), "Requesting Flow Intelligence, hourly cohort flows, token information, buyer/seller cohorts, and transfers from Nansen.", "NANSEN · WALLET EVIDENCE");
  if (button) { button.disabled = true; button.innerHTML = '<span class="sonar-mini">◌</span> Loading wallet evidence...'; }
  try {
    const response = await fetch("/api/nansen/token-evidence", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chain: source.chain, token_address: source.tokenAddress, timeframe: state.observationWindow }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || `Nansen returned HTTP ${response.status}`);
    saveLiveEvidenceCache(source, result);
    state.discoveryChains = Array.isArray(result.chains) ? result.chains.filter(Boolean) : state.discoveryChains;
    const liveFixture = restoreLiveEvidenceCache(source);
    if (!liveFixture.hasWalletEvidence) liveFixture.cases = buildLiveCases(liveFixture);
    fixtureRecords = fixtureRecords.map((fixture) => fixture.key === source.key ? liveFixture : fixture);
    renderFixtureOptions();
    selectFixture(liveFixture.key);
    $("#liveProviderCard").classList.remove("unavailable");
    $("#liveProviderCard").classList.add("available");
    $("#liveLaneState").textContent = result.status === "partial_live" ? "LIVE TOKEN PARTIAL" : "LIVE TOKEN LOADED";
    $("#liveLaneDescription").textContent = result.message + (liveFixture.hasWalletEvidence ? " The map now uses returned buyer, seller, and transfer rows." : " No wallet rows were returned, so the map remains aggregate-only.");
    $("#liveLaneCode").textContent = "/api/v1/tgm/flow-intelligence + tgm/flows + token-information + who-bought-sold + transfers · " + liveFixture.liveCalls + "/" + (result.attempted || 7) + " calls";
    showToast(liveFixture.hasWalletEvidence ? "Live wallet evidence loaded. The graph now uses real returned rows." : "Live token evidence loaded partially. Successful responses were kept and no fake wallet graph was added.");
  } catch (error) {
    showToast("Live token evidence failed: " + error.message);
  } finally {
    if (button) button.disabled = false;
    setInvestigationBusy(false);
    updateInvestigationUI();
  }
}

function runInvestigation() {
  if (state.noLocalData) {
    runLiveDiscovery();
    return;
  }
  if (state.activeFixture?.isLive && !state.activeFixture.hasWalletEvidence && !state.activeFixture.liveEvidenceAttempted) {
    loadLiveTokenEvidence();
    return;
  }
  if (state.activeFixture && !signalScope(state.activeFixture, selectedCase()).wallets.length) {
    state.revealed = false;
    state.revealStage = "ready";
    state.revealProgress = 0;
    updateInvestigationUI();
    drawOcean();
    showToast(state.activeFixture.isLive ? "Live wallet evidence is unavailable for this token after the bounded request. No fake graph was added." : signalScope(state.activeFixture, selectedCase()).reason);
    return;
  }
  if (state.revealStage === "explained") {
    state.revealed = false;
    state.revealStage = "ready";
    state.revealProgress = 0;
    state.animation = 0;
    updateInvestigationUI();
    drawOcean();
    showToast("Grouping reset. The map is back to observed positions.");
    return;
  }
  state.revealed = true;
  state.revealStage = "tracing";
  state.animation = 0;
  state.revealProgress = 0;
  setInvestigationBusy(true, "Analyzing " + (state.activeFixture?.symbol || "selected signal"), "Comparing direction, timing, and observed transfer paths before showing the result.", "BEHAVIOR TRACE · ALL VIEWS");
  updateInvestigationUI();
  showToast("Tracing direction, timing, and route evidence for this signal.");
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    state.animation = 100;
    state.revealProgress = 1;
    state.revealStage = "explained";
    setInvestigationBusy(false);
    drawOcean();
    updateInvestigationUI();
  } else {
    cancelAnimationFrame(state.raf);
    animateReveal();
  }
}

function tickReplay() {
  if (!state.playing) return;
  state.motionPhase += .8;
  const next = state.timeline >= 100 ? 0 : Math.min(100, state.timeline + 1.5);
  $("#timeline").value = next;
  updateTimeline(next);
  drawOcean();
  updateMapNarrative("replay");
  if (next >= 100) {
    stopReplay();
    showToast("Replay reached the end of the saved observation window.");
  }
}

function toggleReplay() {
  if (state.playing) {
    stopReplay();
    showToast("Replay paused. Use Step to move one observation window.");
    return;
  }
  state.playing = true;
  updatePlayButton();
  state.playTimer = window.setInterval(tickReplay, 120);
  showToast("Replay running: fish drift through the saved observation window.");
}

function showToast(message) { const toast = $("#toast"); toast.textContent = message; toast.classList.add("show"); window.clearTimeout(showToast.timer); showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 4200); }
function updateTimeline(value) { state.timeline = Number(value); const input = $("#timeline"); input.style.background = `linear-gradient(90deg, var(--cyan) ${state.timeline}%, rgba(159,198,201,.18) ${state.timeline}%)`; const days = ["SEP 13 · 08:00", "SEP 14 · 18:00", "SEP 16 · 06:00", "SEP 17 · 14:00", "SEP 18 · 22:00", "SEP 20 · 09:14"]; $("#currentTimelineDate").textContent = days[Math.min(days.length - 1, Math.floor(state.timeline / 20))]; }
function togglePlay() { state.playing = !state.playing; $("#playIcon").textContent = state.playing ? "Ⅱ" : "▶"; if (state.playing) tickTimeline(); }
function tickTimeline() { if (!state.playing) return; state.timeline = state.timeline >= 100 ? 0 : state.timeline + .25; $("#timeline").value = state.timeline; updateTimeline(state.timeline); state.raf = requestAnimationFrame(tickTimeline); }

function bindEvents() {
  $("#exploreButton").addEventListener("click", (event) => {
    event.stopImmediatePropagation();
    $("#ocean-view").scrollIntoView({ behavior: "smooth", block: "start" });
    runInvestigation();
  }, true);
  $("#investigateButton").addEventListener("click", (event) => {
    event.stopImmediatePropagation();
    runInvestigation();
  }, true);
  $("#resetMap").addEventListener("click", (event) => {
    event.stopImmediatePropagation();
    state.revealed = false;
    state.revealStage = "ready";
    state.revealProgress = 0;
    state.animation = 0;
    state.selectedWallet = null;
    stopReplay();
    renderEvidence();
    drawOcean();
    showToast("Map reset to observed positions.");
  }, true);
  $("#chainSelect")?.addEventListener("change", (event) => {
    updateTokenCatalogControls();
    renderFixtureOptions({ chain: event.target.value, resetSearch: true });
    const nextKey = $("#tokenSelect")?.value;
    if (nextKey) selectFixture(nextKey);
  });
  $("#tokenSelect")?.addEventListener("change", (event) => selectFixture(event.target.value));
  $("#tokenSearch")?.addEventListener("input", () => renderFixtureOptions({ chain: $("#chainSelect")?.value }));
  $("#windowButton")?.addEventListener("click", () => toggleWindowMenu());
  $$("#windowMenu [data-window]").forEach((option) => option.addEventListener("click", () => setObservationWindow(option.dataset.window)));
  document.addEventListener("click", (event) => { if (!event.target.closest(".window-filter-wrap")) toggleWindowMenu(false); });
  $("#windowButton")?.addEventListener("keydown", (event) => { if (event.key === "Escape") toggleWindowMenu(false); });
  $$(".view-tab").forEach((button) => button.addEventListener("click", () => { $$(".view-tab").forEach((item) => item.classList.toggle("active", item === button)); $$(".view-section").forEach((section) => section.classList.toggle("active", section.id === button.dataset.view)); requestAnimationFrame(() => drawOcean()); }));
  $$(".queue-filter").forEach((button) => button.addEventListener("click", () => { state.filter = button.dataset.filter; $$(".queue-filter").forEach((item) => item.classList.toggle("active", item === button)); renderCaseList(); }));
  $$(".map-tool").forEach((button) => button.addEventListener("click", () => { if (!button.dataset.mapMode) return; state.mapMode = button.dataset.mapMode; $$(".map-tool").forEach((item) => item.classList.toggle("active", item === button)); showToast(`${button.textContent.trim()} view selected. Fish size meaning updated in the legend.`); drawOcean(); }));
  $("#resetMap").addEventListener("click", () => { state.revealed = false; state.animation = 0; state.excluded = null; renderEvidence(); drawOcean(); showToast("Map reset to the selected evidence snapshot."); });
  $("#liveDataButton").addEventListener("click", checkLiveData);
  $("#fullChainButton")?.addEventListener("click", () => loadFullChainPage(false));
  $("#nextTokenPageButton")?.addEventListener("click", () => loadFullChainPage(true));
  $("#saveButton").addEventListener("click", () => { selectedCase().saved = true; showToast(`${selectedCase().id} saved to the local case notebook.`); });
  $("#excludeButton").addEventListener("click", () => { state.excluded = state.excluded === null ? 0 : null; renderEvidence(); drawOcean(); showToast(state.excluded === null ? "Original hypothesis restored." : "Testing the hypothesis without one member. Source data is unchanged."); });
  $("#showAllWallets").addEventListener("click", () => showToast(`${selectedCase().members.length} wallet rows are in this signal. The visible grid is a compact view.`));
  $("#provenanceButton").addEventListener("click", () => { $("#infoModal").showModal(); });
  $("#helpButton").addEventListener("click", () => $("#infoModal").showModal());
  $("#limitationsButton").addEventListener("click", () => { $("#infoModal").showModal(); });
  $("#modalClose").addEventListener("click", () => $("#infoModal").close());
  $("#infoModal").addEventListener("click", (event) => { if (event.target === $("#infoModal")) $("#infoModal").close(); });
  const canvas = $("#oceanCanvas");
  canvas.addEventListener("mousemove", (event) => { const rect = canvas.getBoundingClientRect(); const x = event.clientX - rect.left, y = event.clientY - rect.top; const node = getNodes(rect.width, rect.height).find((n) => Math.hypot(n.x - x, n.y - y) < n.r + 7); const card = $("#mapHoverCard"); if (!node) { card.classList.remove("show"); return; } const alias = node.id === "anchor" ? "0x7a…2f" : `0x${(node.id.length * 31).toString(16).padStart(2, "0")}…${node.id.slice(-2)}`; card.innerHTML = `<small>${node.label.toUpperCase()}</small><b>${alias}</b><span>${node.cluster ? "linked by typed evidence" : "no selected relationship"}</span>`; card.style.left = `${Math.min(rect.width - 165, x + 12)}px`; card.style.top = `${Math.max(10, y - 55)}px`; card.classList.add("show"); });
  canvas.addEventListener("mouseleave", () => $("#mapHoverCard").classList.remove("show"));
  canvas.addEventListener("click", (event) => { const rect = canvas.getBoundingClientRect(); const x = event.clientX - rect.left, y = event.clientY - rect.top; const node = getNodes(rect.width, rect.height).find((n) => Math.hypot(n.x - x, n.y - y) < n.r + 9); if (node) { if (node.cluster && state.selectedId !== "CASE-014") selectCase("CASE-014"); showToast(node.cluster ? "School wallet selected. Open the evidence drawer to inspect the link." : "Wallet selected. No relationship claim is made from proximity."); } });
  window.addEventListener("resize", drawOcean);
}

function mergeLiveDiscoveryRows(rows, options = {}) {
  const records = [...new Map((Array.isArray(rows) ? rows : [])
    .map(buildLiveFixture)
    .filter((fixture) => fixture.chain && fixture.tokenAddress)
    .map((fixture) => [fixture.chain + ":" + fixture.tokenAddress, fixture])).values()];
  const replaceChains = new Set(options.replaceChains || []);
  const existing = fixtureRecords.filter((fixture) => fixture.isLive && (options.replaceAll || replaceChains.has(fixture.chain)) ? false : true);
  const merged = new Map(existing.map((fixture) => [fixture.chain + ":" + fixture.tokenAddress, fixture]));
  records.forEach((fixture) => merged.set(fixture.chain + ":" + fixture.tokenAddress, fixture));
  fixtureRecords = [...merged.values()];
  return records;
}

function applyDiscoveryMetadata(result, mode) {
  const returnedChains = Array.isArray(result.chains) ? result.chains.filter(Boolean) : [];
  state.discoveryChains = [...new Set(state.discoveryChains.concat(returnedChains))];
  state.discoveryMode = mode;
  state.liveDiscoveryLoaded = true;
  state.noLocalData = false;
  renderFixtureOptions({ resetSearch: true });
  $("#liveProviderCard")?.classList.remove("unavailable");
  $("#liveProviderCard")?.classList.add("available");
  $("#liveLaneState").textContent = mode === "universe" ? "FULL LIST LOADED" : "LIVE CONNECTED";
  $("#liveLaneDescription").textContent = `${result.message} The map only draws wallet relationships after the separate wallet evidence request.`;
  $("#liveLaneCode").textContent = `${result.endpoint} · ${result.rows} rows · ${mode === "universe" ? "full-chain mode" : "smart-money candidate mode"}`;
  if ($("#liveDataButton")) $("#liveDataButton").innerHTML = '<span class="live-dot"></span> Refresh live data';
  updateTokenCatalogControls();
}

async function loadFullChainPage(nextPage) {
  const chain = activeCatalogChain();
  const previous = state.fullChainPaging[chain];
  const page = nextPage && previous?.hasMore ? previous.page + 1 : 1;
  const button = $("#fullChainButton");
  state.fullChainLoading = true;
  setInvestigationBusy(true, "Loading " + chainLabel(chain) + " token catalog", "Fetching the selected chain page from Nansen. Other views remain visible while the catalog is being loaded.", "NANSEN · TOKEN CATALOG");
  if (button) button.textContent = page === 1 ? "Loading full chain..." : `Loading page ${page}...`;
  updateTokenCatalogControls();
  try {
    const response = await fetch("/api/nansen/discovery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chains: [chain], mode: "universe", timeframe: state.observationWindow, page, per_page: 1000 })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || `Nansen returned HTTP ${response.status}`);
    const rawRows = Array.isArray(result.data) ? result.data : [];
    if (!rawRows.length) throw new Error(`Nansen returned no tokens for ${chainLabel(chain)} on page ${page}.`);
    saveLiveDiscoveryCache(result);
    const liveRecords = mergeLiveDiscoveryRows(rawRows, { replaceChains: page === 1 ? [chain] : [] });
    if (!liveRecords.length) throw new Error(`Nansen returned no tokens for ${chainLabel(chain)} on page ${page}.`);
    const pagination = result.pagination || {};
    const hasMore = typeof pagination.is_last_page === "boolean" ? !pagination.is_last_page : liveRecords.length >= Number(result.per_page || 1000);
    state.fullChainPaging[chain] = { page: Number(pagination.page || result.page || page), hasMore, rows: (page === 1 ? 0 : previous?.rows || 0) + liveRecords.length };
    applyDiscoveryMetadata(result, "universe");
    if (page === 1 || !state.activeFixture || state.activeFixture.chain !== chain) selectFixture(liveRecords[0].key);
    showToast(`${chainLabel(chain)} full list loaded: ${liveRecords.length.toLocaleString("en-US")} rows from page ${page}. ${hasMore ? "More pages remain." : "Nansen marked it complete."}`);
  } catch (error) {
    showToast(`Full ${chainLabel(chain)} list failed: ${error.message}`);
  } finally {
    state.fullChainLoading = false;
    setInvestigationBusy(false);
    updateTokenCatalogControls();
  }
}

async function runLiveDiscovery() {
  const button = $("#liveDataButton");
  button.disabled = true;
  button.innerHTML = `<span class="live-dot"></span> Checking Nansen...`;
  setInvestigationBusy(true, "Discovering token candidates", "Nansen is screening the configured chains for smart-money candidates.", "NANSEN · TOKEN SCREENER");
  document.querySelector('[data-view="coverage-view"]').click();
  $("#coverage-view").scrollIntoView({ behavior: "smooth", block: "start" });
  try {
    const response = await fetch("/api/nansen/discovery", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chains: ["ethereum", "solana", "base", "arbitrum", "bnb"], mode: "candidates", timeframe: state.observationWindow, page: 1, per_page: 50 }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || `Nansen returned HTTP ${response.status}`);
    saveLiveDiscoveryCache(result);
    const liveRecords = mergeLiveDiscoveryRows(result.data, { replaceAll: true });
    if (!liveRecords.length) throw new Error("Nansen returned no token candidates for the selected chains.");
    state.liveDiscoveryLoaded = true;
    state.fullChainPaging = {};
    applyDiscoveryMetadata(result, "candidates");
    selectFixture(liveRecords[0].key);
    showToast(`Nansen live discovery passed: ${result.rows} rows loaded. One provider request was used; wallet endpoints were spared.`);
  } catch (error) {
    showToast(`Nansen live discovery failed: ${error.message}`);
  } finally {
    button.disabled = false;
    setInvestigationBusy(false);
    button.innerHTML = `<span class="live-dot"></span> ${state.liveDiscoveryLoaded ? "Refresh live data" : "Check live data"}`;
  }
}

async function checkLiveData() {
  return runLiveDiscovery();
}

async function init() {
  ensureClarityUI();
  mountFixtureControls();
  mountWindowControl();
  mountSearchableTokenControl();
  renderCaseList();
  renderEvidence();
  bindEvents();
  requestAnimationFrame(() => drawOcean());
  try {
    await loadFixtures();
  } catch (error) {
    showToast("Local provider data could not be loaded: " + error.message);
  }
}

init();
