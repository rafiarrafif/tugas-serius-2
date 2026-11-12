import axios from "axios";
import { data, useLoaderData } from "react-router";
import type { Route } from "./+types/stall-edit";

import { EditStallPage } from "../../src/modules/stalls/pages/EditStallPage";
import {
  getCurrentUser,
  getStallById,
} from "../../src/modules/stalls/services/stall.service";
import { BackendRequestError } from "../../src/shared/lib/api-handler";
import { getAuthToken } from "../lib/auth-session.server";

export async function loader({ request, params }: Route.LoaderArgs) {
  const token = getAuthToken(request);
  const stallId = Number(params.stall_id);

  if (!token) {
    return data(
      { stall: null, authorized: false, statusCode: 401 },
      { status: 401 },
    );
  }

  if (!Number.isInteger(stallId) || stallId <= 0) {
    return data(
      { stall: null, authorized: false, statusCode: 404 },
      { status: 404 },
    );
  }

  try {
    const currentUser = await getCurrentUser(token);
    const stallResponse = await getStallById(stallId);

    const authorized =
      currentUser.role === "admin" ||
      (currentUser.role === "owner" &&
        currentUser.userId === stallResponse.data.ownerId);

    return data(
      {
        stall: stallResponse.data,
        authorized,
        statusCode: authorized ? 200 : 403,
      },
      { status: authorized ? 200 : 403 },
    );
  } catch (error) {
    const statusCode =
      error instanceof BackendRequestError && error.responseStatus === 401
        ? 401
        : (error instanceof BackendRequestError &&
              error.responseStatus === 404) ||
            (axios.isAxiosError(error) && error.response?.status === 404)
          ? 404
          : 500;
    return data(
      { stall: null, authorized: false, statusCode },
      { status: statusCode },
    );
  }
}

export default function StallEditRoute() {
  const { stall, authorized, statusCode } = useLoaderData<typeof loader>();
  return (
    <EditStallPage
      stall={stall}
      authorized={authorized}
      statusCode={statusCode}
    />
  );
}
