import { useLoaderData } from "react-router";
import type { Route } from "./+types/stall-detail";

import { getAuthToken } from "../lib/auth-session.server";
import { getCurrentUser } from "../../src/modules/stalls/services/stall.service";
import { StallDetailPage } from "../../src/modules/stalls/pages/StallDetailPage";

export async function loader({ request }: Route.LoaderArgs) {
  const token = getAuthToken(request);

  if (!token) {
    return { currentUser: null };
  }

  try {
    return { currentUser: await getCurrentUser(token) };
  } catch {
    return { currentUser: null };
  }
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Stall details" },
    { name: "description", content: "View stall details and menu items." },
  ];
}

export default function StallDetailRoute() {
  const { currentUser } = useLoaderData<typeof loader>();
  return <StallDetailPage currentUser={currentUser} />;
}
