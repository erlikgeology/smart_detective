const baseUrl = `http://127.0.0.1:${process.env.PORT || 4173}`;
const checks = [
  ["HTML route", "/", "Smart Detective"],
  ["JavaScript asset", "/app.js", "Investigate school"],
  ["CSS asset", "/styles.css", "--cyan"],
];

for (const [label, path, expected] of checks) {
  const response = await fetch(`${baseUrl}${path}`);
  const body = await response.text();
  if (!response.ok || !body.includes(expected)) {
    throw new Error(`${label} failed: HTTP ${response.status}`);
  }
  console.log(`PASS ${label}: ${response.status}`);
}

const configResponse = await fetch(`${baseUrl}/api/nansen/config`);
const config = await configResponse.json();
if (!configResponse.ok || typeof config.configured !== "boolean") {
  throw new Error(`Nansen config route failed: HTTP ${configResponse.status}`);
}
console.log(`PASS Nansen config route: ${config.configured ? "configured" : "not configured"}`);

const faviconResponse = await fetch(`${baseUrl}/favicon.ico`);
if (faviconResponse.status !== 204) throw new Error(`Favicon route failed: HTTP ${faviconResponse.status}`);
console.log("PASS favicon route: 204");

console.log("PASS Smart Detective local smoke check");
