# jsonld-api-client

A typed client for JSON-LD / Hydra APIs, as served by
[API Platform](https://api-platform.com).

It wraps [openapi-fetch](https://openapi-ts.dev/openapi-fetch/) with what such
an API expects on every call — the bearer token, the scope header, the right
content type — and adds two things you end up writing anyway: a cache that
resolves an IRI to its document, and Mercure subscriptions for live updates.

```ts
import { configureClient, createGenericClient } from "jsonld-api-client"
import type { paths } from "./api-schema"

configureClient({
  baseUrl: "https://api.example.com",
  getAuthToken: () => (isLogged() ? getUserToken() : undefined),
})

const client = createGenericClient<paths>()

const { data } = await client.GET("/api/articles/{id}", {
  params: { path: { id: "42" } },
})
```

## Installation

```bash
pnpm add jsonld-api-client
```

`react` is a peer dependency, needed only by the `useMercure` hook.

## Configuration

The package knows how to talk to a JSON-LD API, not which one, nor who is
signed in. Both come from `configureClient`, called once at startup. Every
setting has a default, so an API served from the same origin needs no
configuration at all.

```ts
configureClient({
  // Root URL of the API. Defaults to the current origin.
  baseUrl: "https://api.example.com",

  // Bearer token for each request, or undefined when nobody is signed in.
  // Read on every call, so a refreshed token takes effect immediately.
  getAuthToken: () => (isLogged() ? getUserToken() : undefined),

  // Value of the X-Scope header, when the API segments responses by scope.
  getScope: () => getCurrentScope(),

  // Path of the Mercure hub, appended to baseUrl.
  mercurePath: "/.well-known/mercure",
})
```

Keeping the token behind a function rather than a value is deliberate: the
client never holds a copy that could go stale, and it stays unaware of how the
session is stored.

## What it does on every request

| Situation | Header |
| --- | --- |
| A session is open | `Authorization: Bearer …` |
| A scope is configured | `X-Scope: …` |
| Any method except DELETE | `Content-Type: application/ld+json` |
| PATCH | `Content-Type: application/merge-patch+json` |

The PATCH case matters: API Platform rejects a merge patch sent as plain
JSON-LD.

## Resolving IRIs

A JSON-LD API returns relations as IRIs. `httpApiStore` fetches the document
behind one and keeps it, so rendering a list of relations doesn't refetch the
same resource for every row.

```ts
import {
  fetchDataFromApiPlatform,
  getDataFromApiPlatform,
  removeDataFromApiPlatform,
} from "jsonld-api-client"

const author = await fetchDataFromApiPlatform("/api/users/7")
getDataFromApiPlatform("/api/users/7") // cached, no request
removeDataFromApiPlatform("/api/users/7") // drop it, e.g. after an update
```

## Live updates

`useMercure` subscribes to a topic and re-renders on each message pushed by the
API. `buildTopic` turns a resource path into the topic the hub expects.

```tsx
import { buildTopic, useMercure } from "jsonld-api-client"

function ArticleList() {
  const { data, isConnected } = useMercure(buildTopic("/api/articles"))
  // …
}
```

## Errors

`ApiError` wraps the `application/problem+json` body returned by API Platform
in a `response`, so the status and the validation violations stay readable:

```ts
import { ApiError } from "jsonld-api-client"

try {
  await client.POST("/api/articles", { body })
} catch (error) {
  if (error instanceof ApiError) {
    error.response.status // 422
    error.response.data.violations?.forEach((v) =>
      console.log(v.propertyPath, v.message)
    )
  }
}
```

The `ApiJsonLdError` type describes that body, and `react-data-form` consumes
it directly to place each violation under its field.

## Development

```bash
pnpm install
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

## License

MIT
