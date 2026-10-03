# Stack desk

`/stack` is a private desk for the Cloudflare account, Cursor cloud agents, and Apple Developer records used by YouNeeK Pro Radar. Open it from Settings, or go directly to `/stack`.

The page sends an access key with each request. The Worker reads the provider APIs and returns names, status, and dates. It does not return API tokens, private keys, or certificate bodies.

## Secrets

Set these as runtime secrets on the weather Worker `youneekproradarbaby` (Settings → Variables and Secrets), not as build variables.

| Name | Purpose |
|---|---|
| `STACK_ACCESS_KEY` | Password you type into `/stack`. Required before any live read. |
| `CLOUDFLARE_API_TOKEN` | Account, Workers Scripts, Zone, and Pages read token. |
| `CLOUDFLARE_ACCOUNT_ID` | Optional. Limits the desk to one account. |
| `CURSOR_API_KEY` | User API key from Cursor Dashboard → API Keys. |
| `APPLE_ISSUER_ID` | App Store Connect issuer ID. |
| `APPLE_KEY_ID` | Key ID for the App Store Connect `.p8`. |
| `APPLE_PRIVATE_KEY` | That `.p8`, one line with `\n` between lines. |

WeatherKit status reuses the existing `WEATHERKIT_*` secrets. Those do not have to be the same key as App Store Connect.

```bash
npx wrangler secret put STACK_ACCESS_KEY
npx wrangler secret put CLOUDFLARE_API_TOKEN
npx wrangler secret put CURSOR_API_KEY
npx wrangler secret put APPLE_ISSUER_ID
npx wrangler secret put APPLE_KEY_ID
npx wrangler secret put APPLE_PRIVATE_KEY
```

## Local preview

Copy `.env.example` to `.env`, set `STACK_ACCESS_KEY`, and run `npm run dev`. With no provider tokens, the desk shows the known workers and a connect note for each account.

`STACK_FIXTURE=1` fills the local desk with sample rows so the layout can be checked. It is ignored when a real provider token is present, and it is ignored unless the site role is local.
