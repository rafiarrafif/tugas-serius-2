import type { Route } from "./+types/stall-detail";

import { StallDetailPage } from "../../src/modules/stalls/pages/StallDetailPage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Stall details" },
    { name: "description", content: "View stall details and menu items." },
  ];
}

export default StallDetailPage;
