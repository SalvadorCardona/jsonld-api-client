# jsonld-api-client

## 0.2.0

### Minor Changes

- 1e18466: Initial release: a typed client for JSON-LD / Hydra APIs — openapi-fetch with
  the auth, scope and content-type headers such an API expects, an IRI cache, and
  Mercure subscriptions.

  The base URL, the bearer token and the scope come from `configureClient` rather
  than from imports, so the package stays unaware of the application hosting it
  and of how its session is stored. Covered by 24 tests.

- 4a917fc: Compatibilité avec le protocole Mercure 1.0 (hubs v1.0+, FrankenPHP 1.13+).

  Nouvelle option `mercureProtocol: "0.x" | "1.0"` dans `configureClient`, à
  `"1.0"` par défaut. En 1.0, `clientMercure` et `useMercure` s'abonnent avec
  `match=` pour un topic exact et `match_urlpattern=` pour un modèle (les `{id}`
  de `buildTopic()` deviennent `:id`), et ouvrent l'`EventSource` avec
  `withCredentials: true` pour que le cookie du hub parte aussi en cross-origin.

  **Changement cassant** : contre un hub 0.x, ajoutez
  `configureClient({ mercureProtocol: "0.x" })` pour retrouver `topic=`.
