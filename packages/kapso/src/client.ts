import type { KapsoToolResponse } from "./types.ts";

export type KapsoClientConfig = {
  apiKey: string;
  baseUrl?: string;
};

export class KapsoClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(config: KapsoClientConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl ?? "https://api.kapso.io";
  }

  async sendMessage(conversationId: string, response: KapsoToolResponse): Promise<void> {
    const res = await fetch(`${this.baseUrl}/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(response),
    });
    if (!res.ok) {
      throw new Error(`Kapso API error: ${res.status} ${res.statusText}`);
    }
  }
}
