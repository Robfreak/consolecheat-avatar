import { createFileRoute } from "@tanstack/react-router";
import { AvatarTool } from "@/components/avatar-tool";
import { I18nProvider } from "@/lib/i18n";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <I18nProvider>
      <AvatarTool />
    </I18nProvider>
  );
}
