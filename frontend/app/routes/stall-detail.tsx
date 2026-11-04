import { data, redirect, useFetcher, useLoaderData } from "react-router";
import type { Route } from "./+types/stall-detail";

import { getAuthToken } from "../lib/auth-session.server";
import {
  deleteStall,
  getCurrentUser,
} from "../../src/modules/stalls/services/stall.service";
import { StallDetailPage } from "../../src/modules/stalls/pages/StallDetailPage";
import { BackendRequestError } from "../../src/shared/lib/api-handler";

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

export async function action({ request, params }: Route.ActionArgs) {
  const token = getAuthToken(request);
  const stallId = Number(params.stall_id);

  if (!token || !Number.isInteger(stallId) || stallId <= 0) {
    return data(
      { deleteError: "You do not have permission to delete this stall." },
      { status: 403 },
    );
  }

  try {
    await deleteStall(stallId, token);
    return redirect("/stall");
  } catch (error) {
    return data(
      {
        deleteError:
          error instanceof Error
            ? error.message
            : "Unable to delete the stall.",
      },
      {
        status:
          error instanceof BackendRequestError && error.responseStatus === 403
            ? 403
            : 400,
      },
    );
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
  const deleteFetcher = useFetcher<typeof action>();

  return (
    <StallDetailPage
      currentUser={currentUser}
      isDeleting={deleteFetcher.state !== "idle"}
      deleteError={deleteFetcher.data?.deleteError ?? null}
      onDelete={() => deleteFetcher.submit({}, { method: "post" })}
    />
  );
}
