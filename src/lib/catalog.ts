export type Avatar = {
  sku: string;
  name: string;
  image: string | null;
  price: number | null;
  display: string;
  platforms: string[];
};

export type RegionInfo = {
  id: string;
  label: string;
  locale: string;
  count: number;
  free: number;
};

export function isFree(avatar: Avatar): boolean {
  if (avatar.price === 0) return true;
  const label = avatar.display.trim().toLowerCase();
  return (
    label === "free" ||
    label === "kostenlos" ||
    label === "gratuit" ||
    label === "gratis" ||
    label === "무료" ||
    label === "免费" ||
    label === "免費" ||
    label === "無料"
  );
}

export function parseCatalog(raw: unknown): Avatar[] {
  if (!Array.isArray(raw)) return [];
  const avatars: Avatar[] = [];
  for (const row of raw) {
    if (!Array.isArray(row) || typeof row[0] !== "string" || typeof row[1] !== "string") continue;
    avatars.push({
      sku: row[0],
      name: row[1],
      image: typeof row[2] === "string" ? row[2] : null,
      price: typeof row[3] === "number" ? row[3] : null,
      display: typeof row[4] === "string" ? row[4] : "",
      platforms: Array.isArray(row[5])
        ? row[5]
            .filter((platform) => typeof platform === "string")
            .map((platform) => platform.replaceAll("™", "").trim())
            .filter(Boolean)
        : [],
    });
  }
  return avatars;
}

function catalogUrl(file: string): string {
  const base = import.meta.env.BASE_URL || "/";
  return `${base}data/avatars/${file}`;
}

export async function loadRegions(): Promise<RegionInfo[]> {
  const response = await fetch(catalogUrl("index.json"));
  if (!response.ok) throw new Error("index");
  const data = (await response.json()) as RegionInfo[];
  return data.filter((region) => typeof region.id === "string" && /^[a-z]{2}$/.test(region.id));
}

export async function loadCatalog(regionId: string): Promise<Avatar[]> {
  if (!/^[a-z]{2}$/.test(regionId)) throw new Error("region");
  const response = await fetch(catalogUrl(`${regionId}.json`));
  if (!response.ok) throw new Error("catalog");
  return parseCatalog(await response.json());
}
