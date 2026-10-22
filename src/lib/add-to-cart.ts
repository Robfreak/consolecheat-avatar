/** Paste the Cloudflare Worker URL here, without a trailing slash. */
export const WORKER_URL = "https://avatar.leonkrieger599.workers.dev";

export type ItemStatus = "added" | "skipped" | "failed";

export type AddResult = {
  authFailed: boolean;
  cartFull: boolean;
  results: { sku: string; status: ItemStatus; message?: string }[];
  error?: string;
};

const ERROR_TEXT: Record<string, string> = {
  invalid_cookie: "Invalid cookie. Paste only the pdccws_p value.",
  unknown_region: "Unknown region.",
  not_in_catalog: "Only avatars from this region's catalog can be added.",
  catalog_unavailable: "This region's catalog could not be loaded.",
  invalid_request: "Invalid request.",
  too_many: "Too many avatars in one request.",
  not_configured: "The cart service is not set up yet.",
};

export async function addAvatarBatch(input: {
  token: string;
  region: string;
  skus: string[];
}): Promise<AddResult> {
  const base = WORKER_URL.trim().replace(/\/$/, "");
  if (!base) throw new Error("not_configured");
  const response = await fetch(`${base}/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      token: input.token,
      region: input.region,
      skus: input.skus.slice(0, 4),
    }),
  });
  let payload: AddResult | null = null;
  try {
    payload = (await response.json()) as AddResult;
  } catch {
    payload = null;
  }
  if (!response.ok || !payload || !Array.isArray(payload.results)) {
    const code = payload?.error ?? "invalid_request";
    throw new Error(ERROR_TEXT[code] ? code : "invalid_request");
  }
  return {
    authFailed: Boolean(payload.authFailed),
    cartFull: Boolean(payload.cartFull),
    results: payload.results,
    error: payload.error,
  };
}
