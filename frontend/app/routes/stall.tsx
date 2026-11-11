import type { Route } from "./+types/stall";

import { StallListPage } from "../../src/modules/stalls/pages/StallListPage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Stalls" },
    { name: "description", content: "Browse available stalls." },
  ];
}

export default StallListPage;
