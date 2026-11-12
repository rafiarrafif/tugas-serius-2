import { data, redirect } from "react-router";
import type { Route } from "./+types/auth.login";

import { LoginPage } from "../../src/modules/auth/pages/LoginPage";
import { getCurrentAccount } from "../../src/modules/auth/services/auth.service";
import {
  commitAccountProfile,
  commitAuthToken,
  getAuthToken,
} from "../lib/auth-session.server";

export async function loader({ request }: Route.LoaderArgs) {
  if (getAuthToken(request)) {
    return redirect("/");
  }

  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const token = String(formData.get("token") ?? "");
  if (!token) {
    return data(
      { message: "Unable to establish your session." },
      { status: 400 },
    );
  }

  try {
    const user = await getCurrentAccount(token);
    const headers = new Headers();
    headers.append("Set-Cookie", commitAuthToken(token));
    headers.append(
      "Set-Cookie",
      commitAccountProfile({
        name: user.name,
        email: user.email,
        role: user.role,
      }),
    );

    return data({ ok: true }, { headers });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to verify your account.";
    return data({ message }, { status: 401 });
  }
}

export default LoginPage;
