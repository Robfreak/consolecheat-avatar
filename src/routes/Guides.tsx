import { createFileRoute } from "@tanstack/react-router";
import { Guides } from "@/components/guides";
import { I18nProvider } from "@/lib/i18n";

export const Route = createFileRoute("/Guides")({
  head: () => ({
    meta: [
      { title: "Guides | PSN Avatar Cart | consolecheat" },
      {
        name: "description",
        content:
          "How to add PlayStation avatars to your cart. One avatar opens PlayStation checkout. Every free avatar uses the pdccws_p cookie.",
      },
    ],
    links: [{ rel: "canonical", href: "https://avatar.consolecheat.com/Guides" }],
  }),
  component: GuidesRoute,
});

function GuidesRoute() {
  return (
    <I18nProvider>
      <Guides />
    </I18nProvider>
  );
}
