import { redirect } from "react-router";
import type { Route } from "./+types/logout";

import {
  clearAccountProfile,
  clearAuthToken,
} from "../lib/auth-session.server";

export async function action({ request }: Route.ActionArgs) {
  const isLoggedIn = request.headers.get("Cookie")?.includes("auth_token=");

  if (isLoggedIn) {
    const headers = new Headers();
    headers.append("Set-Cookie", clearAuthToken());
    headers.append("Set-Cookie", clearAccountProfile());

    return redirect("/auth/login", {
      headers,
    });
  }

  return redirect("/auth/login");
}

export async function loader() {
  return redirect("/auth/login");
}
