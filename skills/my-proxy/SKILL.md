---
name: my-proxy
description: Route specific apps/processes through the developer's residential IP via a SOCKS5 proxy on their laptop, reachable over Tailscale. Use when a server/process needs to egress through the home connection, when "proxy", "residential IP", "SOCKS5", "Tailscale", or `ALL_PROXY` come up, or when a request fails from a datacenter IP but should work from home.
---

# Residential Proxy over Tailscale (`my-proxy`)

The developer's laptop runs a SOCKS5 proxy (`microsocks`) bound to its Tailscale IP. Any
machine in the same tailnet (servers, CI runners, dev boxes) can route **selected** apps and
processes through it, so that traffic egresses via the laptop's **residential WiFi** instead of
a datacenter IP.

This is **opt-in per process** — nothing is proxied by default. You point only the apps that
need the residential IP at the proxy; everything else keeps using the machine's normal route.

## When to use

- A server process must reach an endpoint that allow-lists the developer's home IP, or that
  blocks datacenter ranges.
- You want a single command/script to inherit the residential egress without touching global
  network config.
- Debugging "works on my machine, fails on the server" where the difference is the source IP.

## When NOT to use

- You need **all** traffic on a host routed through home → that's a Tailscale **exit node**
  (`tailscale up --exit-node=<laptop-ip>`), not this proxy. This skill is for per-process only.
- The laptop is offline/asleep → the proxy is unreachable and proxied processes will fail.
  It is a developer convenience, never a production dependency.

## Connection details

| Field | Value |
|---|---|
| Proxy type | SOCKS5 (no auth) |
| Host | Laptop's Tailscale IP (`100.x.y.z`) or MagicDNS name (e.g. `laptop`) |
| Port | `1080` |
| URL form | `socks5://<host>:1080` (use `socks5h://` to resolve DNS at the laptop too) |

Resolve the current host from any tailnet machine:

```bash
tailscale status                 # find the laptop entry
tailscale ip -4                  # (on the laptop) prints its 100.x.y.z
```

Prefer the MagicDNS name (`socks5h://laptop:1080`) over a hard-coded IP — it survives tailnet
re-logins. Never commit the raw `100.x.y.z` into source; read it from an env var
(`PROXY_HOST`) or MagicDNS.

## Using the proxy from a process

The `proxied` wrapper (bundled in `scripts/proxied`) sets `ALL_PROXY`, `HTTP(S)_PROXY` and
`http(s)_proxy` for a single command and runs it — nothing leaks to other processes:

```bash
PROXY_HOST=laptop proxied curl https://api.ipify.org      # prints the home IP
PROXY_HOST=laptop proxied python scrape.py
PROXY_HOST=100.101.102.103 proxied ./my-binary
```

Without the wrapper, set the proxy explicitly per tool:

```bash
# curl (use -hostname so DNS resolves at the laptop)
curl --socks5-hostname laptop:1080 https://api.ipify.org

# git, single repo only (no --global)
git config http.proxy socks5h://laptop:1080

# env vars for one process
ALL_PROXY=socks5h://laptop:1080 ./app
```

### Language SDKs

Node's `fetch`/`http` ignore `*_proxy` env vars — pass an agent explicitly:

```ts
import { SocksProxyAgent } from "socks-proxy-agent";
const agent = new SocksProxyAgent(`socks5h://${process.env.PROXY_HOST}:1080`);
const res = await fetch(url, { agent });   // works with axios/got/undici dispatcher too
```

Python `requests` needs the SOCKS extra (`pip install "requests[socks]"`):

```python
import os
host = os.environ["PROXY_HOST"]
proxies = {"http": f"socks5h://{host}:1080", "https": f"socks5h://{host}:1080"}
requests.get(url, proxies=proxies)
```

Docker — proxy a single service via its environment:

```yaml
services:
  scraper:
    environment:
      ALL_PROXY: socks5h://laptop:1080
```

## Verifying

A proxied request should return the laptop's residential IP; an un-proxied one returns the
host's own IP. Compare:

```bash
curl https://api.ipify.org                                # host IP
PROXY_HOST=laptop proxied curl https://api.ipify.org      # home IP — must differ
```

If they match, the proxy isn't being applied (check the tool actually honors `ALL_PROXY`, or
use its native proxy flag). If the proxied call hangs, the laptop is likely offline/asleep or
the SOCKS port isn't bound to the Tailscale IP.

## Laptop-side setup (reference — run once on the laptop, macOS)

The skill assumes this is already running. To (re)provision the laptop:

1. Install: `brew install --cask tailscale && brew install microsocks`, then `tailscale up`.
2. Bind the proxy to the **Tailscale IP only** (never `0.0.0.0` — microsocks has no auth):
   `microsocks -i $(tailscale ip -4 | head -1) -p 1080`.
3. Persist it with a `caffeinate`-wrapped LaunchAgent so it survives login and keeps the
   laptop awake — see `scripts/com.local.microsocks.plist.example` in this skill.
4. (Optional) Lock it down further with a Tailscale ACL that only allows your servers to reach
   port `1080`, and enable MagicDNS so machines use `laptop` instead of the raw IP.

## Security notes

- `microsocks` has **no authentication**. Safety comes entirely from binding to the Tailscale
  interface, so only tailnet members can reach it. Never bind to `0.0.0.0` or forward the port
  publicly. If you need real auth, switch the laptop to `dante`/`3proxy`.
- Treat the proxy as untrusted-availability infrastructure: any process behind it must tolerate
  the laptop being offline. Don't make CI or production code paths depend on it.
- Respect the residential ISP's terms of service and the destination's terms — this routes real
  traffic through a home connection.
