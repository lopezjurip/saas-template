import DataLoader from "dataloader";

export type IpApiResult = { status: string; city?: string; country?: string; query: string };

export class GeoLoader extends DataLoader<string, IpApiResult | null> {
  constructor(opts: DataLoader.Options<string, IpApiResult | null> = {}) {
    super(GeoLoader.batch, {
      cache: true,
      /** Max */
      maxBatchSize: 100,
      ...opts,
    });
  }

  private static async batch(ips: readonly string[]): Promise<(IpApiResult | null)[]> {
    try {
      const res = await fetch("http://ip-api.com/batch?fields=status,city,country,query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ips.map((ip) => ({ query: ip }))),
        signal: AbortSignal.timeout(3000),
        cache: "no-store",
      });
      if (!res.ok) {
        console.error("[GeoLoader] failed to fetch geo data: %o", { status: res.status, statusText: res.statusText });
        return ips.map(() => null);
      }
      const rows: IpApiResult[] = await res.json();
      const map = new Map(rows.map((r) => [r.query, r]));
      return ips.map((ip) => map.get(ip) ?? null);
    } catch {
      return ips.map(() => null);
    }
  }
}
