import { data, redirect, useLoaderData } from "react-router";
import type { Route } from "./+types/stall-edit";

import { EditStallPage } from "../../src/modules/stalls/pages/EditStallPage";
import {
  getCurrentUser,
  getStallById,
  updateStall,
} from "../../src/modules/stalls/services/stall.service";
import type {
  CreateStallActionResult,
  CreateStallInput,
} from "../../src/modules/stalls/types/stall.types";
import { BackendRequestError } from "../../src/shared/lib/api-handler";
import { getAuthToken } from "../lib/auth-session.server";

function readFormText(formData: FormData, name: keyof CreateStallInput) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const token = getAuthToken(request);
  const stallId = Number(params.stall_id);

  if (!token || !Number.isInteger(stallId) || stallId <= 0) {
    return data({ stall: null, authorized: false }, { status: 403 });
  }

  try {
    const [currentUser, stallResponse] = await Promise.all([
      getCurrentUser(token),
      getStallById(stallId),
    ]);

    const authorized =
      currentUser.role === "admin" ||
      (currentUser.role === "owner" &&
        currentUser.userId === stallResponse.data.ownerId);

    return data(
      { stall: stallResponse.data, authorized },
      { status: authorized ? 200 : 403 },
    );
  } catch {
    return data({ stall: null, authorized: false }, { status: 404 });
  }
}

export async function action({ request, params }: Route.ActionArgs) {
  const token = getAuthToken(request);
  const stallId = Number(params.stall_id);

  if (!token || !Number.isInteger(stallId) || stallId <= 0) {
    return data<CreateStallActionResult>(
      {
        forbidden: true,
        message: "You do not have permission to edit this stall.",
      },
      { status: 403 },
    );
  }

  try {
    const currentUser = await getCurrentUser(token);
    const stallResponse = await getStallById(stallId);
    const authorized =
      currentUser.role === "admin" ||
      (currentUser.role === "owner" &&
        currentUser.userId === stallResponse.data.ownerId);

    if (!authorized) {
      return data<CreateStallActionResult>(
        {
          forbidden: true,
          message: "You do not have permission to edit this stall.",
        },
        { status: 403 },
      );
    }

    const formData = await request.formData();
    const payload: CreateStallInput = {
      name: readFormText(formData, "name"),
      category: readFormText(formData, "category"),
      location: readFormText(formData, "location"),
      description: readFormText(formData, "description"),
    };

    const fieldErrors: NonNullable<CreateStallActionResult["fieldErrors"]> = {};

    if (payload.name.length < 3 || payload.name.length > 100) {
      fieldErrors.name = "Enter a stall name between 3 and 100 characters.";
    }
    if (payload.category.length > 50) {
      fieldErrors.category = "Category must be 50 characters or fewer.";
    }
    if (payload.location.length > 100) {
      fieldErrors.location = "Location must be 100 characters or fewer.";
    }
    if (payload.description.length > 1000) {
      fieldErrors.description = "Description must be 1000 characters or fewer.";
    }

    if (Object.keys(fieldErrors).length > 0) {
      return data<CreateStallActionResult>(
        { message: "Check the highlighted fields.", fieldErrors },
        { status: 400 },
      );
    }

    await updateStall(stallId, payload, token);
    return redirect(`/stall/${stallId}`);
  } catch (error) {
    const forbidden =
      error instanceof BackendRequestError && error.responseStatus === 403;
    const message =
      error instanceof Error ? error.message : "Unable to update the stall.";

    return data<CreateStallActionResult>(
      { message, forbidden },
      { status: forbidden ? 403 : 400 },
    );
  }
}

export default function StallEditRoute() {
  const { stall, authorized } = useLoaderData<typeof loader>();
  return <EditStallPage stall={stall} authorized={authorized} />;
}
