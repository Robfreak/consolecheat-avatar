import { useEffect, useMemo, useRef, useState } from "react";
import {
  CircleAlert,
  CircleCheck,
  ExternalLink,
  KeyRound,
  Loader2,
  Search,
  Shield,
  ShoppingBag,
} from "lucide-react";
import { addAvatarBatch, type ItemStatus } from "@/lib/add-to-cart";
import { isFree, loadCatalog, loadRegions, type Avatar, type RegionInfo } from "@/lib/catalog";
import { useI18n, type Lang } from "@/lib/i18n";

const TOKEN_KEY = "avatarlade-token";
const REGION_KEY = "avatarlade-region";
const PAGE_SIZE = 24;
const BATCH = 4;
const indexKey = (region: string) => `avatarlade-index-${region}`;

type LogLine = { id: string; name: string; status: ItemStatus; message?: string };
type PriceFilter = "all" | "free" | "paid";
type SortId = "price" | "price-desc" | "name";

function readIndex(region: string): number {
  const raw = sessionStorage.getItem(indexKey(region));
  const value = raw ? Number(raw) : 0;
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function explainError(error: unknown, translate: (key: "workerMissing" | "shortCookie" | "loadError" | "requestFail") => string): string {
  const code = error instanceof Error ? error.message : "";
  if (code === "not_configured") return translate("workerMissing");
  if (code === "invalid_cookie") return translate("shortCookie");
  if (code === "catalog_unavailable" || code === "unknown_region") return translate("loadError");
  return translate("requestFail");
}

function guessRegion(regions: RegionInfo[]): string {
  const locale = navigator.language.toLowerCase();
  const country = locale.split("-")[1];
  if (country && regions.some((region) => region.id === country)) return country;
  if (locale.startsWith("de") && regions.some((region) => region.id === "de")) return "de";
  if (regions.some((region) => region.id === "us")) return "us";
  return regions[0]?.id ?? "us";
}

function AvatarThumb({ avatar }: { avatar: Avatar }) {
  const [broken, setBroken] = useState(false);
  if (!avatar.image || broken) {
    return (
      <div className="flex aspect-square items-center justify-center bg-raised text-sm text-subtle">
        {avatar.name.slice(0, 1)}
      </div>
    );
  }
  return (
    <img
      src={avatar.image}
      alt=""
      loading="lazy"
      className="aspect-square w-full object-cover"
      onError={() => setBroken(true)}
    />
  );
}

export function AvatarTool() {
  const { lang, setLang, t, country, languages } = useI18n();
  const [draft, setDraft] = useState("");
  const [token, setToken] = useState("");
  const [regions, setRegions] = useState<RegionInfo[]>([]);
  const [region, setRegion] = useState("us");
  const [catalog, setCatalog] = useState<Avatar[]>([]);
  const [catalogState, setCatalogState] = useState<"loading" | "ready" | "error">("loading");
  const [query, setQuery] = useState("");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [platform, setPlatform] = useState("all");
  const [sort, setSort] = useState<SortId>("price");
  const [page, setPage] = useState(0);
  const [cursor, setCursor] = useState(0);
  const [running, setRunning] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [added, setAdded] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [failed, setFailed] = useState(0);
  const [log, setLog] = useState<LogLine[]>([]);
  const [busySku, setBusySku] = useState<string | null>(null);
  const [openSku, setOpenSku] = useState<string | null>(null);
  const [copiedSku, setCopiedSku] = useState<string | null>(null);
  const stopRef = useRef(false);

  const freeList = useMemo(() => catalog.filter(isFree), [catalog]);
  const names = useMemo(() => {
    const map = new Map<string, string>();
    for (const avatar of catalog) map.set(avatar.sku, avatar.name);
    return map;
  }, [catalog]);
  const platforms = useMemo(() => {
    const set = new Set<string>();
    for (const avatar of catalog) {
      for (const name of avatar.platforms) set.add(name);
    }
    return [...set].sort();
  }, [catalog]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const list = catalog.filter((avatar) => {
      if (priceFilter === "free" && !isFree(avatar)) return false;
      if (priceFilter === "paid" && isFree(avatar)) return false;
      if (platform !== "all" && !avatar.platforms.includes(platform)) return false;
      if (needle && !avatar.name.toLowerCase().includes(needle)) return false;
      return true;
    });
    const sorted = [...list];
    sorted.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      const ap = a.price ?? Number.MAX_SAFE_INTEGER;
      const bp = b.price ?? Number.MAX_SAFE_INTEGER;
      return sort === "price-desc" ? bp - ap : ap - bp;
    });
    return sorted;
  }, [catalog, query, priceFilter, platform, sort]);

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageItems = visible.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  useEffect(() => {
    const saved = sessionStorage.getItem(TOKEN_KEY);
    if (saved) setToken(saved);
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadRegions()
      .then((list) => {
        if (cancelled) return;
        const sorted = [...list].sort((a, b) => a.label.localeCompare(b.label));
        setRegions(sorted);
        const saved = sessionStorage.getItem(REGION_KEY);
        const next = saved && sorted.some((item) => item.id === saved) ? saved : guessRegion(sorted);
        setRegion(next);
        setCursor(readIndex(next));
      })
      .catch(() => {
        if (!cancelled) setCatalogState("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!regions.some((item) => item.id === region)) return;
    let cancelled = false;
    setCatalogState("loading");
    setPage(0);
    loadCatalog(region)
      .then((list) => {
        if (cancelled) return;
        setCatalog(list);
        setCatalogState("ready");
      })
      .catch(() => {
        if (!cancelled) {
          setCatalog([]);
          setCatalogState("error");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [region, regions]);

  useEffect(() => {
    setPage(0);
  }, [query, priceFilter, platform, sort]);

  function changeRegion(next: string) {
    if (running) return;
    setRegion(next);
    sessionStorage.setItem(REGION_KEY, next);
    setCursor(readIndex(next));
    setNotice(null);
    setLog([]);
  }

  function saveToken() {
    const value = draft.trim();
    if (value.length < 20) {
      setNotice(t("shortCookie"));
      return;
    }
    sessionStorage.setItem(TOKEN_KEY, value);
    setToken(value);
    setDraft("");
    setNotice(null);
  }

  function clearToken() {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken("");
    setDraft("");
  }

  function pushLog(sku: string, status: ItemStatus, message?: string) {
    const name = names.get(sku) ?? sku;
    setLog((current) => [{ id: `${sku}-${current.length}`, name, status, message }, ...current].slice(0, 8));
    if (status === "added") setAdded((count) => count + 1);
    if (status === "skipped") setSkipped((count) => count + 1);
    if (status === "failed") setFailed((count) => count + 1);
  }

  function resetProgress() {
    if (running) return;
    sessionStorage.removeItem(indexKey(region));
    setCursor(0);
    setAdded(0);
    setSkipped(0);
    setFailed(0);
    setLog([]);
    setNotice(null);
  }

  async function runFree() {
    if (!token) {
      setNotice(t("needCookie"));
      return;
    }
    stopRef.current = false;
    setRunning(true);
    setNotice(null);
    let index = cursor;
    try {
      while (index < freeList.length && !stopRef.current) {
        const slice = freeList.slice(index, index + BATCH);
        const result = await addAvatarBatch({
          token,
          region,
          skus: slice.map((avatar) => avatar.sku),
        });
        for (const item of result.results) pushLog(item.sku, item.status, item.message);
        const step = result.results.length > 0 ? result.results.length : slice.length;
        index += step;
        setCursor(index);
        sessionStorage.setItem(indexKey(region), String(index));
        if (result.authFailed) {
          setNotice(t("authFail"));
          break;
        }
        if (result.cartFull) {
          setNotice(t("cartFull"));
          break;
        }
        if (result.results.length === 0) break;
      }
      if (!stopRef.current && index >= freeList.length) setNotice(t("doneFree"));
    } catch (error) {
      setNotice(explainError(error, t));
    } finally {
      setRunning(false);
    }
  }

  async function addSingle(avatar: Avatar) {
    if (!token || running) {
      setNotice(t("needCookie"));
      return;
    }
    setBusySku(avatar.sku);
    setNotice(null);
    try {
      const result = await addAvatarBatch({ token, region, skus: [avatar.sku] });
      const item = result.results[0];
      if (item) pushLog(item.sku, item.status, item.message);
      if (result.authFailed) setNotice(t("authFail"));
      if (result.cartFull) setNotice(t("cartFull"));
    } catch (error) {
      setNotice(explainError(error, t));
    } finally {
      setBusySku(null);
    }
  }

  async function copyAvatarId(sku: string) {
    try {
      await navigator.clipboard.writeText(sku);
      setCopiedSku(sku);
    } catch {
      setCopiedSku(null);
    }
  }

  const freeTotal = freeList.length;
  const percent = freeTotal === 0 ? 0 : Math.round((cursor / freeTotal) * 100);
  const connected = token.length > 0;
  const from = visible.length === 0 ? 0 : safePage * PAGE_SIZE + 1;
  const to = Math.min(visible.length, (safePage + 1) * PAGE_SIZE);
  const ready = catalogState === "ready";
  const help = t("cookieHelp").split("pdccws_p");

  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg border border-line bg-surface">
              <ShoppingBag className="size-4" aria-hidden="true" />
            </span>
            <div>
              <p className="font-display text-lg leading-none font-medium tracking-tight">consolecheat</p>
              <p className="text-sm text-subtle">{t("unofficial")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <p className="hidden text-sm text-muted sm:block">{connected ? t("connected") : t("disconnected")}</p>
            <label className="sr-only" htmlFor="language">
              {t("language")}
            </label>
            <select
              id="language"
              value={lang}
              onChange={(event) => setLang(event.target.value as Lang)}
              className="min-h-11 max-w-40 rounded-lg border border-line bg-bg px-2 text-sm sm:max-w-52"
            >
              {languages.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:py-12">
        <section className="max-w-2xl">
          <p className="text-sm font-medium tracking-wide text-muted uppercase">{t("eyebrow")}</p>
          <h1 className="mt-3 font-display text-4xl leading-tight font-medium tracking-tight sm:text-5xl">{t("title")}</h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">{t("lede")}</p>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-medium">{t("cookieTitle")}</h2>
                <p className="mt-1 text-sm text-muted">
                  {help[0]}
                  <span className="text-fg">pdccws_p</span>
                  {help[1] ?? ""}
                </p>
              </div>
              <KeyRound className="mt-1 size-4 shrink-0 text-subtle" aria-hidden="true" />
            </div>
            <label className="mt-4 block text-sm font-medium" htmlFor="cookie">
              {t("cookieLabel")}
            </label>
            <textarea
              id="cookie"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              spellCheck={false}
              autoComplete="off"
              rows={4}
              placeholder={t("cookiePlaceholder")}
              className="mt-2 w-full resize-y rounded-lg border border-line bg-bg px-3 py-3 text-sm text-fg outline-none focus:border-muted"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={saveToken} className="min-h-11 rounded-lg bg-accent px-4 text-sm font-medium text-accent-fg">
                {t("saveCookie")}
              </button>
              {connected ? (
                <button type="button" onClick={clearToken} className="min-h-11 rounded-lg border border-line px-4 text-sm text-muted">
                  {t("disconnect")}
                </button>
              ) : null}
            </div>
            <label className="mt-5 block text-sm font-medium" htmlFor="region">
              {t("regionLabel")}
            </label>
            <select
              id="region"
              value={region}
              onChange={(event) => changeRegion(event.target.value)}
              disabled={running || regions.length === 0}
              className="mt-2 min-h-11 w-full rounded-lg border border-line bg-bg px-3 text-sm"
            >
              {regions.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {country(entry.id, entry.label)} · {entry.locale} · {entry.free.toLocaleString()} {t("priceFree").toLowerCase()} /{" "}
                  {entry.count.toLocaleString()}
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm text-subtle">{t("missingStores")}</p>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
            <h2 className="font-display text-xl font-medium">{t("cartTitle")}</h2>
            <p className="mt-1 text-sm text-muted tabular-nums">
              {Math.min(cursor, freeTotal).toLocaleString()} / {freeTotal.toLocaleString()} {t("tried")}
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-bg">
              <div className="h-full bg-accent" style={{ width: `${percent}%` }} />
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg border border-line px-2 py-3">
                <dt className="text-xs text-subtle">{t("statAdded")}</dt>
                <dd className="mt-1 text-lg tabular-nums text-ok">{added}</dd>
              </div>
              <div className="rounded-lg border border-line px-2 py-3">
                <dt className="text-xs text-subtle">{t("statSkipped")}</dt>
                <dd className="mt-1 text-lg tabular-nums">{skipped}</dd>
              </div>
              <div className="rounded-lg border border-line px-2 py-3">
                <dt className="text-xs text-subtle">{t("statFailed")}</dt>
                <dd className="mt-1 text-lg tabular-nums text-bad">{failed}</dd>
              </div>
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              {running ? (
                <button
                  type="button"
                  onClick={() => {
                    stopRef.current = true;
                  }}
                  className="min-h-11 rounded-lg bg-accent px-4 text-sm font-medium text-accent-fg"
                >
                  {t("stop")}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!ready || freeTotal === 0 || cursor >= freeTotal}
                  onClick={() => void runFree()}
                  className="min-h-11 rounded-lg bg-accent px-4 text-sm font-medium text-accent-fg disabled:opacity-40"
                >
                  {cursor > 0 && cursor < freeTotal ? t("resume") : t("addFree")}
                </button>
              )}
              <button
                type="button"
                disabled={running || cursor === 0}
                onClick={resetProgress}
                className="min-h-11 rounded-lg border border-line px-4 text-sm disabled:opacity-40"
              >
                {t("reset")}
              </button>
              <a
                href="https://checkout.playstation.com/cart"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-line px-4 text-sm"
              >
                {t("openCart")}
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            </div>
            {running ? (
              <p className="mt-3 flex items-center gap-2 text-sm text-muted">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                {t("working")}
              </p>
            ) : null}
            {notice ? <p className="mt-3 text-sm text-fg">{notice}</p> : null}
            {log.length > 0 ? (
              <ul className="mt-4 flex flex-col gap-1 text-sm">
                {log.map((line) => (
                  <li key={line.id} className="truncate">
                    <span className={line.status === "added" ? "text-ok" : line.status === "failed" ? "text-bad" : "text-muted"}>
                      {line.status === "added" ? t("statAdded") : line.status === "skipped" ? t("statSkipped") : t("statFailed")}
                    </span>
                    <span className="text-muted"> · {line.name}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>

        <section>
          <div className="flex flex-col gap-3">
            <div>
              <h2 className="font-display text-2xl font-medium">{t("catalogTitle")}</h2>
              <p className="text-sm text-muted">
                {t("showing")} {from.toLocaleString()}–{to.toLocaleString()} {t("of")} {visible.length.toLocaleString()}
              </p>
            </div>
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
              <label className="relative block w-full lg:max-w-xs">
                <span className="sr-only">{t("searchLabel")}</span>
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t("searchPlaceholder")}
                  className="min-h-11 w-full rounded-lg border border-line bg-surface pr-3 pl-10 text-sm outline-none focus:border-muted"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["all", "priceAll"],
                    ["free", "priceFree"],
                    ["paid", "pricePaid"],
                  ] as const
                ).map(([id, key]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPriceFilter(id)}
                    className={`min-h-11 rounded-lg px-3 text-sm ${priceFilter === id ? "bg-accent text-accent-fg" : "border border-line text-muted"}`}
                    aria-pressed={priceFilter === id}
                  >
                    {t(key)}
                  </button>
                ))}
              </div>
              <select
                value={platform}
                onChange={(event) => setPlatform(event.target.value)}
                aria-label={t("platformAll")}
                className="min-h-11 rounded-lg border border-line bg-surface px-3 text-sm"
              >
                <option value="all">{t("platformAll")}</option>
                {platforms.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as SortId)}
                aria-label={t("sortPrice")}
                className="min-h-11 rounded-lg border border-line bg-surface px-3 text-sm"
              >
                <option value="price">{t("sortPrice")}</option>
                <option value="price-desc">{t("sortPriceDesc")}</option>
                <option value="name">{t("sortName")}</option>
              </select>
            </div>
          </div>

          {catalogState === "loading" ? <p className="mt-6 text-sm text-muted">{t("loading")}</p> : null}
          {catalogState === "error" ? <p className="mt-6 text-sm text-bad">{t("loadError")}</p> : null}
          {ready && visible.length === 0 ? <p className="mt-6 text-sm text-muted">{t("empty")}</p> : null}
          {ready && visible.length > 0 ? (
            <>
              <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {pageItems.map((avatar) => {
                  const free = isFree(avatar);
                  return (
                    <li key={avatar.sku} className="overflow-hidden rounded-xl border border-line bg-surface">
                      <button
                        type="button"
                        onClick={() => setOpenSku((current) => (current === avatar.sku ? null : avatar.sku))}
                        aria-expanded={openSku === avatar.sku}
                        className="block w-full text-left"
                      >
                        <AvatarThumb avatar={avatar} />
                      </button>
                      <div className="flex flex-col gap-3 p-3">
                        <button
                          type="button"
                          onClick={() => setOpenSku((current) => (current === avatar.sku ? null : avatar.sku))}
                          className="text-left"
                        >
                          <p className="line-clamp-2 text-sm leading-snug">{avatar.name}</p>
                          <p className={`mt-1 text-sm ${free ? "text-ok" : "text-fg"}`}>
                            {free ? t("freeWord") : avatar.display || t("unavailable")}
                            {avatar.platforms[0] ? <span className="text-subtle"> · {avatar.platforms.join(", ")}</span> : null}
                          </p>
                        </button>
                        {openSku === avatar.sku ? (
                          <div className="rounded-lg border border-line bg-bg p-2">
                            <p className="text-xs text-subtle">{t("avatarId")}</p>
                            <p className="mt-1 break-all font-mono text-xs select-all">{avatar.sku}</p>
                            <button
                              type="button"
                              onClick={() => void copyAvatarId(avatar.sku)}
                              className="mt-2 min-h-11 rounded-lg border border-line px-3 text-sm"
                            >
                              {copiedSku === avatar.sku ? t("copied") : t("copyId")}
                            </button>
                          </div>
                        ) : null}
                        <button
                          type="button"
                          disabled={!connected || running || busySku === avatar.sku}
                          onClick={() => void addSingle(avatar)}
                          className="min-h-11 rounded-lg border border-line text-sm disabled:opacity-40"
                        >
                          {busySku === avatar.sku ? t("adding") : t("addOne")}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={safePage === 0}
                  onClick={() => setPage((current) => Math.max(0, current - 1))}
                  className="min-h-11 rounded-lg border border-line px-4 text-sm disabled:opacity-40"
                >
                  {t("prev")}
                </button>
                <p className="text-sm text-muted tabular-nums">
                  {t("page")} {safePage + 1} / {pageCount}
                </p>
                <button
                  type="button"
                  disabled={safePage >= pageCount - 1}
                  onClick={() => setPage((current) => current + 1)}
                  className="min-h-11 rounded-lg border border-line px-4 text-sm disabled:opacity-40"
                >
                  {t("next")}
                </button>
              </div>
            </>
          ) : null}
        </section>

        <section className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <Shield className="mt-1 size-4 shrink-0 text-subtle" aria-hidden="true" />
            <div>
              <h2 className="font-display text-xl font-medium">{t("safetyTitle")}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">{t("safetyBody")}</p>
            </div>
          </div>
          <ol className="mt-5 grid gap-3 text-sm leading-relaxed text-muted sm:grid-cols-2">
            {(
              [
                ["tip1", "ok"],
                ["tip2", "ok"],
                ["tip3", "warn"],
                ["tip4", "warn"],
              ] as const
            ).map(([key, tone]) => (
              <li key={key} className="flex gap-3">
                {tone === "ok" ? (
                  <CircleCheck className="mt-0.5 size-4 shrink-0 text-ok" aria-hidden="true" />
                ) : (
                  <CircleAlert className="mt-0.5 size-4 shrink-0 text-warn" aria-hidden="true" />
                )}
                {t(key)}
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm text-subtle">{t("domain")}</p>
        </section>
      </main>
    </div>
  );
}
