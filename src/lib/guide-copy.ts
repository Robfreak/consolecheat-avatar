import type { Lang } from "@/lib/i18n";

export type GuideBlock = {
  title: string;
  body: string[];
  steps?: string[];
};

export type GuideDoc = {
  kicker: string;
  title: string;
  intro: string;
  back: string;
  sections: GuideBlock[];
};

const en: GuideDoc = {
  kicker: "How it works",
  title: "Add avatars without hunting the console store.",
  intro:
    "Sony no longer lists avatars on the store website. This page does. Nothing is paid here. You always finish on PlayStation, with your own account.",
  back: "Back to the catalog",
  sections: [
    {
      title: "Two ways into the cart",
      body: [
        "PlayStation checkout needs no cookie. On an avatar, press PlayStation checkout. Sony’s page opens with that one avatar. Sign in if asked, then confirm. If it costs money, you pay there. Free avatars still have to be confirmed on that page. One avatar at a time.",
        "The cookie is for the whole free list. Paste pdccws_p, save it, and press Add every free. Free avatars from the selected region go into the cart in small groups. Paid avatars are left out of that run.",
      ],
    },
    {
      title: "Pick the account’s country",
      body: [
        "The flag is the country of the PSN account, not the language of this page. Sony only accepts a cart for that country. If adds fail at once, switch the region to the country shown on the account.",
        "Mainland China is not in the list. That store does not publish this catalog.",
      ],
    },
    {
      title: "Copy the cookie",
      body: [
        "You only need this for Add every free and for Add to cart. PlayStation checkout does not use it. The value stays in this browser tab. Closing the tab removes it. It is not kept on a server here.",
      ],
      steps: [
        "Open store.playstation.com and sign in.",
        "Open developer tools. Chrome or Edge: F12, then Application. Firefox: F12, then Storage.",
        "Under Cookies, open https://store.playstation.com.",
        "Click pdccws_p. Turn on Show URL-decoded. Copy the entire value. It is long.",
        "Paste it into the cookie field and press Save cookie.",
      ],
    },
    {
      title: "Add every free avatar",
      body: ["This run only sends free avatars. Paid ones stay in the catalog until you add them yourself."],
      steps: [
        "Save the cookie and pick the account region.",
        "Press Add every free. The bar counts how many free avatars have been tried.",
        "Added means it entered the cart. Already in means it was there. Failed means Sony refused that one.",
        "Stop pauses. Resume free continues from the same place. Reset progress starts over.",
        "If PlayStation rejects the cookie, copy a fresh pdccws_p. Store sessions expire.",
        "If the cart is full, open it, finish or remove items on PlayStation, then press Resume free.",
        "Open cart shows Sony’s cart. You still confirm there.",
      ],
    },
    {
      title: "One avatar, free or paid",
      body: [
        "Search by name. Filter free or paid, and PS3, PS4 or PS5. Sort by price or name.",
        "PlayStation checkout works without a cookie, including paid avatars.",
        "Add to cart uses the saved cookie and stays on this page.",
        "Click the name to show the avatar ID. That ID is the PlayStation SKU. Copy ID if you need it.",
      ],
    },
    {
      title: "Keep the cookie private",
      body: [
        "Anyone with your pdccws_p can use the PlayStation Store as you. Paste only your own, and do not send it to anyone.",
        "This site is unofficial and is not Sony. There is no account here, no password, and no payment. The cookie is sent only to PlayStation, and only to put catalog avatars in the cart.",
      ],
    },
  ],
};

const de: GuideDoc = {
  kicker: "So funktioniert es",
  title: "Avatare in den Warenkorb, ohne sie auf der Konsole zu suchen.",
  intro:
    "Sony zeigt Avatare auf der Store-Webseite nicht mehr an. Diese Seite schon. Bezahlt wird hier nichts. Abgeschlossen wird immer bei PlayStation, mit dem eigenen Konto.",
  back: "Zurück zum Katalog",
  sections: [
    {
      title: "Zwei Wege in den Warenkorb",
      body: [
        "Die PlayStation-Kasse braucht keinen Cookie. Beim Avatar auf PlayStation-Kasse drücken. Sonys Seite öffnet sich mit genau diesem Avatar. Falls nötig anmelden und bestätigen. Kostet er etwas, zahlst du dort. Auch Gratis-Avatare müssen auf der Seite bestätigt werden. Immer nur einer.",
        "Der Cookie ist für die ganze Gratis-Liste. pdccws_p einfügen, speichern und Alle Gratis hinzufügen drücken. Die kostenlosen Avatare der gewählten Region gehen in kleinen Gruppen in den Warenkorb. Kostenpflichtige lässt dieser Lauf aus.",
      ],
    },
    {
      title: "Das Land des Kontos wählen",
      body: [
        "Die Flagge ist das Land des PSN-Kontos, nicht die Sprache dieser Seite. Sony nimmt einen Warenkorb nur für dieses Land an. Schlagen die Zugaben sofort fehl, die Region auf das Land des Kontos stellen.",
        "Festlandchina steht nicht in der Liste. Dieser Store veröffentlicht diesen Katalog nicht.",
      ],
    },
    {
      title: "Den Cookie kopieren",
      body: [
        "Den brauchst du nur für Alle Gratis hinzufügen und für In den Warenkorb. Die PlayStation-Kasse nutzt ihn nicht. Der Wert bleibt in diesem Browser-Tab. Schließt du den Tab, ist er weg. Auf einem Server liegt er hier nicht.",
      ],
      steps: [
        "store.playstation.com öffnen und anmelden.",
        "Entwicklertools öffnen. Chrome oder Edge: F12, dann Application. Firefox: F12, dann Speicher.",
        "Unter Cookies https://store.playstation.com öffnen.",
        "pdccws_p anklicken. Show URL-decoded einschalten. Den ganzen Wert kopieren. Er ist lang.",
        "In das Cookie-Feld einfügen und Cookie speichern drücken.",
      ],
    },
    {
      title: "Alle Gratis-Avatare hinzufügen",
      body: ["Dieser Lauf schickt nur kostenlose Avatare. Kostenpflichtige bleiben im Katalog, bis du sie einzeln hinzufügst."],
      steps: [
        "Cookie speichern und die Region des Kontos wählen.",
        "Alle Gratis hinzufügen drücken. Der Balken zählt, wie viele Gratis-Avatare schon versucht wurden.",
        "Hinzugefügt heißt, er ist im Warenkorb. Schon drin heißt, er war schon da. Fehlgeschlagen heißt, Sony hat diesen abgelehnt.",
        "Stopp hält an. Fortsetzen macht an derselben Stelle weiter. Fortschritt zurücksetzen fängt von vorn an.",
        "Lehnt PlayStation den Cookie ab, einen neuen pdccws_p kopieren. Store-Sitzungen laufen ab.",
        "Ist der Warenkorb voll, ihn öffnen, bei PlayStation abschließen oder leeren, dann Fortsetzen drücken.",
        "Warenkorb öffnen zeigt Sonys Warenkorb. Bestätigt wird dort.",
      ],
    },
    {
      title: "Ein Avatar, gratis oder kostenpflichtig",
      body: [
        "Nach Namen suchen. Nach gratis oder kostenpflichtig filtern, und nach PS3, PS4 oder PS5. Nach Preis oder Namen sortieren.",
        "Die PlayStation-Kasse geht ohne Cookie, auch bei kostenpflichtigen Avataren.",
        "In den Warenkorb nutzt den gespeicherten Cookie und bleibt auf dieser Seite.",
        "Den Namen anklicken, dann steht die Avatar-ID da. Das ist die PlayStation-SKU. ID kopieren, wenn du sie brauchst.",
      ],
    },
    {
      title: "Den Cookie für dich behalten",
      body: [
        "Wer deinen pdccws_p hat, kann den PlayStation Store als du benutzen. Nur den eigenen einfügen und ihn niemandem schicken.",
        "Die Seite ist inoffiziell und nicht von Sony. Hier gibt es kein Konto, kein Passwort und keine Zahlung. Der Cookie geht nur an PlayStation, und nur um Katalog-Avatare in den Warenkorb zu legen.",
      ],
    },
  ],
};

const COPY: Partial<Record<Lang, GuideDoc>> = { en, de };

export function guideDoc(lang: Lang): GuideDoc {
  return COPY[lang] ?? en;
}
