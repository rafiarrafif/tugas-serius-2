import { data, useLoaderData } from "react-router";
import type { Route } from "./+types/stall.create";

import { CreateStallPage } from "../../src/modules/stalls/pages/CreateStallPage";
import { getVerifiedUserRole } from "../../src/modules/stalls/services/stall.service";
import { getAuthToken } from "../lib/auth-session.server";

async function canCreateStall(token: string | undefined): Promise<boolean> {
  if (!token) {
    return false;
  }

  try {
    const role = await getVerifiedUserRole(token);
    return role === "owner" || role === "admin";
  } catch {
    return false;
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  const authorized = await canCreateStall(getAuthToken(request));
  return data({ authorized }, { status: authorized ? 200 : 403 });
}

export default function CreateStallRoute() {
  const { authorized } = useLoaderData<typeof loader>();
  return <CreateStallPage authorized={authorized} />;
}
