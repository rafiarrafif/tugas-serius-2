import { useLoaderData } from "react-router";
import { getAuthToken } from "../lib/auth-session.server";
import { getVerifiedUserRole } from "../../src/modules/stalls/services/stall.service";
import type { Route } from "./+types/stall";

import { StallListPage } from "../../src/modules/stalls/pages/StallListPage";

export async function loader({ request }: Route.LoaderArgs) {
  const token = getAuthToken(request);
  let role: string | undefined;

  if (token) {
    try {
      role = await getVerifiedUserRole(token);
    } catch {
      role = undefined;
    }
  }

  return { canCreateStall: role === "owner" || role === "admin" };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Stalls" },
    { name: "description", content: "Browse available stalls." },
  ];
}

export default function StallRoute() {
  const { canCreateStall } = useLoaderData<typeof loader>();
  return <StallListPage canCreateStall={canCreateStall} />;
}
