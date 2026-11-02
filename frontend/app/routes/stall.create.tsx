import { data, redirect, useLoaderData } from "react-router";
import type { Route } from "./+types/stall.create";

import { CreateStallPage } from "../../src/modules/stalls/pages/CreateStallPage";
import {
  createStall,
  getVerifiedUserRole,
} from "../../src/modules/stalls/services/stall.service";
import type {
  CreateStallActionResult,
  CreateStallInput,
} from "../../src/modules/stalls/types/stall.types";
import { BackendRequestError } from "../../src/shared/lib/api-handler";
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

function readFormText(formData: FormData, name: keyof CreateStallInput) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export async function loader({ request }: Route.LoaderArgs) {
  const authorized = await canCreateStall(getAuthToken(request));
  return data({ authorized }, { status: authorized ? 200 : 403 });
}

export async function action({ request }: Route.ActionArgs) {
  const token = getAuthToken(request);

  if (!token || !(await canCreateStall(token))) {
    return data<CreateStallActionResult>(
      {
        forbidden: true,
        message: "You do not have permission to create a stall.",
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

  try {
    await createStall(payload, token);
    return redirect("/stall");
  } catch (error) {
    const forbidden =
      error instanceof BackendRequestError && error.responseStatus === 403;
    const message =
      error instanceof Error ? error.message : "Unable to create the stall.";

    return data<CreateStallActionResult>(
      { message, forbidden },
      { status: forbidden ? 403 : 400 },
    );
  }
}

export default function CreateStallRoute() {
  const { authorized } = useLoaderData<typeof loader>();
  return <CreateStallPage authorized={authorized} />;
}
