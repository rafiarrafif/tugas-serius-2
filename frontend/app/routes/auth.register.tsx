import { redirect } from "react-router";
import type { Route } from "./+types/auth.register";

import { RegisterPage } from "../../src/modules/auth/pages/RegisterPage";
import { getAuthToken } from "../lib/auth-session.server";

export async function loader({ request }: Route.LoaderArgs) {
  if (getAuthToken(request)) {
    return redirect("/");
  }

  return null;
}

export default RegisterPage;
