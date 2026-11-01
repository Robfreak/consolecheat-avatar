import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { guideDoc } from "@/lib/guide-copy";
import { useI18n, type Lang } from "@/lib/i18n";

const THEME_KEY = "consolecheat-theme";

function applyTheme(theme: "dark" | "light") {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);
  document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
    meta.setAttribute("content", theme === "light" ? "#f4f1eb" : "#07090e");
  });
}

export function Guides() {
  const { lang, setLang, t, languages } = useI18n();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const doc = guideDoc(lang);

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
  }, []);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/80 shadow-[inset_0_2px_0_var(--color-accent)] backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <a href="/" className="font-display text-lg leading-none font-medium tracking-tight">
            consolecheat
          </a>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-line bg-bg p-0.5" role="group" aria-label={t("theme")}>
              <button
                type="button"
                aria-pressed={theme === "dark"}
                onClick={() => {
                  applyTheme("dark");
                  setTheme("dark");
                }}
                className={`inline-flex min-h-10 items-center gap-1.5 rounded-md px-2.5 text-sm ${theme === "dark" ? "bg-accent text-accent-fg" : "text-muted"}`}
              >
                <Moon className="size-3.5" aria-hidden="true" />
                <span className="max-sm:sr-only">{t("themeDark")}</span>
              </button>
              <button
                type="button"
                aria-pressed={theme === "light"}
                onClick={() => {
                  applyTheme("light");
                  setTheme("light");
                }}
                className={`inline-flex min-h-10 items-center gap-1.5 rounded-md px-2.5 text-sm ${theme === "light" ? "bg-accent text-accent-fg" : "text-muted"}`}
              >
                <Sun className="size-3.5" aria-hidden="true" />
                <span className="max-sm:sr-only">{t("themeLight")}</span>
              </button>
            </div>
            <label className="sr-only" htmlFor="guide-language">
              {t("language")}
            </label>
            <select
              id="guide-language"
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
      <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <p className="flex items-center gap-3 text-xs font-medium tracking-[0.18em] text-steel uppercase">
          <span className="h-px w-8 bg-steel" aria-hidden="true" />
          {doc.kicker}
        </p>
        <h1 className="mt-3 font-display text-4xl leading-[1.05] font-medium tracking-tight sm:text-5xl">{doc.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">{doc.intro}</p>
        <div className="mt-8 flex flex-col gap-4">
          {doc.sections.map((section, index) => (
            <section key={section.title} className="panel rounded-2xl p-4 sm:p-5">
              <h2 className="font-display text-xl font-medium">
                <span className="mr-2 text-steel tabular-nums">{index + 1}</span>
                {section.title}
              </h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} className="mt-3 text-sm leading-relaxed text-muted">
                  {paragraph}
                </p>
              ))}
              {section.steps ? (
                <ol className="mt-4 flex flex-col gap-2">
                  {section.steps.map((step, stepIndex) => (
                    <li key={step} className="flex gap-3 text-sm leading-relaxed">
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent text-xs font-medium text-accent-fg">
                        {stepIndex + 1}
                      </span>
                      <span className="pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              ) : null}
            </section>
          ))}
        </div>
        <a href="/" className="mt-8 inline-flex min-h-11 items-center text-sm text-steel">
          {doc.back}
        </a>
      </main>
    </div>
  );
}
