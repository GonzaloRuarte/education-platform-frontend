import { RESOURCE_HASH_PREFIX } from "./constants.js";

export function parseResourceHash(): { resourceKey: string | null; params: URLSearchParams } {
  if (!location.hash.startsWith(RESOURCE_HASH_PREFIX)) {
    return { resourceKey: null, params: new URLSearchParams() };
  }
  const rest = location.hash.slice(RESOURCE_HASH_PREFIX.length);
  const separator = rest.indexOf("?");
  const rawKey = separator === -1 ? rest : rest.slice(0, separator);
  const rawQuery = separator === -1 ? "" : rest.slice(separator + 1);
  return {
    resourceKey: rawKey ? decodeURIComponent(rawKey) : null,
    params: new URLSearchParams(rawQuery),
  };
}

export function resourceHash(resourceKey: string, params: URLSearchParams = new URLSearchParams()): string {
  const query = params.toString();
  return `${RESOURCE_HASH_PREFIX}${encodeURIComponent(resourceKey)}${query ? `?${query}` : ""}`;
}

export function replaceResourceHash(resourceKey: string, params: URLSearchParams = new URLSearchParams()): void {
  const desiredHash = resourceHash(resourceKey, params);
  if (location.hash !== desiredHash) {
    history.replaceState(null, "", desiredHash);
  }
}
