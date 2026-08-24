import { BaseJsonLdItemInterface } from "jsonld-item"
import genericClient from "@/client"
import { ApiError } from "@/ApiError"
import { ApiJsonLdError } from "@/apiPlatform"

const store = {} as Record<string, BaseJsonLdItemInterface>
const queue = {} as Record<string, Promise<BaseJsonLdItemInterface>>

export async function fetchDataFromApiPlatform(
  iri: string
): Promise<BaseJsonLdItemInterface> {
  if (Object.hasOwn(queue, iri)) {
    return queue[iri]
  }

  if (Object.hasOwn(store, iri)) {
    return store[iri]
  }

  const promise = genericClient
    .GET(iri as any, {})
    .then(({ data, error, response }) => {
      if (error !== undefined) {
        throw new ApiError({
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          data: error as ApiJsonLdError,
        })
      }
      store[iri] = data as BaseJsonLdItemInterface
      return data as BaseJsonLdItemInterface
    })
    .finally(() => {
      delete queue[iri]
    })

  queue[iri] = promise

  return promise
}

export function getDataFromApiPlatform(
  iri: string
): BaseJsonLdItemInterface | undefined {
  return store[iri]
}

export function removeDataFromApiPlatform(iri: string): void {
  delete store[iri]
}
