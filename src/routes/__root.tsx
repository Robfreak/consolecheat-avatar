import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import appCss from "../styles.css?url";

const APP_NAME = "PSN Avatar Cart | consolecheat";
const APP_DESCRIPTION =
  "Add free and paid PlayStation Network avatars to your cart. Paste your pdccws_p cookie, choose a PSN region, and send every free avatar to checkout.";
const JSON_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "consolecheat PSN Avatar Cart",
  url: "https://avatar.consolecheat.com/",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  browserRequirements: "Requires JavaScript",
  isAccessibleForFree: true,
  description: APP_DESCRIPTION,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  isPartOf: { "@type": "WebSite", name: "consolecheat", url: "https://consolecheat.com/" },
});

const THEME_BOOT = `(function(){try{var s=localStorage.getItem("consolecheat-theme");var t=s==="light"||s==="dark"?s:(matchMedia("(prefers-color-scheme: light)").matches?"light":"dark");document.documentElement.dataset.theme=t;var c=t==="light"?"#f4f1eb":"#0e1116";var m=document.querySelector('meta[name="theme-color"]');if(!m){m=document.createElement("meta");m.setAttribute("name","theme-color");document.head.appendChild(m)}m.setAttribute("content",c)}catch(e){document.documentElement.dataset.theme="dark"}})();`;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      { name: "description", content: APP_DESCRIPTION },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { name: "author", content: "consolecheat" },
      { property: "og:url", content: "https://avatar.consolecheat.com/" },
    ],
    links: [
      { rel: "canonical", href: "https://avatar.consolecheat.com/" },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Outfit:wght@500;600&family=Source+Sans+3:wght@400;500;600&display=swap",
      },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: () => (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON_LD }} />
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
