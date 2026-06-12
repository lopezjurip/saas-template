type IpApiResult = { status: string; city?: string; country?: string; query: string };

export async function fetchGeoMap(ips: string[]): Promise<Map<string, string>> {
  const unique = [...new Set(ips.filter(Boolean))];
  if (!unique.length) return new Map();
  try {
    const res = await fetch("http://ip-api.com/batch?fields=status,city,country,query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(unique.map((ip) => ({ query: ip }))),
      signal: AbortSignal.timeout(3000),
      cache: "no-store",
    });
    if (!res.ok) return new Map();
    const rows = (await res.json()) as IpApiResult[];
    const map = new Map<string, string>();
    for (const r of rows) {
      if (r.status === "success" && r.city && r.country) {
        map.set(r.query, `${r.city}, ${r.country}`);
      }
    }
    return map;
  } catch {
    return new Map();
  }
}
