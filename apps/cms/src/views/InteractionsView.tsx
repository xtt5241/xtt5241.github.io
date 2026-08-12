import { DefaultTemplate } from "@payloadcms/next/templates";
import type { AdminViewServerProps, VisibleEntities } from "payload";
import InteractionsManager from "@/components/InteractionsManager";

export default function InteractionsView({ visibleEntities, ...props }: AdminViewServerProps) {
  return (
    <DefaultTemplate {...props} visibleEntities={(visibleEntities ?? { collections: [], globals: [] }) as VisibleEntities}>
      <InteractionsManager />
    </DefaultTemplate>
  );
}
