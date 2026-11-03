import { redirect } from "react-router";
import type { Route } from "./+types/logout";

import { clearAuthToken } from "../lib/auth-session.server";

export async function action({ request }: Route.ActionArgs) {
  const isLoggedIn = request.headers.get("Cookie")?.includes("auth_token=");

  if (isLoggedIn) {
    return redirect("/auth/login", {
      headers: {
        "Set-Cookie": clearAuthToken(),
      },
    });
  }

  return redirect("/auth/login");
}

export async function loader() {
  return redirect("/auth/login");
}
