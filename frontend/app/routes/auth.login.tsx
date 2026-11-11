import { data, redirect } from "react-router";
import type { Route } from "./+types/auth.login";

import { LoginPage } from "../../src/modules/auth/pages/LoginPage";
import { loginCustomer } from "../../src/modules/auth/services/auth.service";
import type {
  LoginActionResult,
  LoginRequest,
} from "../../src/modules/auth/types/auth.types";
import { commitAuthToken, getAuthToken } from "../lib/auth-session.server";

export async function loader({ request }: Route.LoaderArgs) {
  if (getAuthToken(request)) {
    return redirect("/");
  }

  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const credentials: LoginRequest = {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };
  const fieldErrors: NonNullable<LoginActionResult["fieldErrors"]> = {};

  if (!credentials.email) {
    fieldErrors.email = "Enter your email address.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
    fieldErrors.email = "Enter a valid email address.";
  }

  if (!credentials.password) {
    fieldErrors.password = "Enter your password.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return data<LoginActionResult>(
      { message: "Check the highlighted fields.", fieldErrors },
      { status: 400 },
    );
  }

  try {
    const token = await loginCustomer(credentials);

    return data<LoginActionResult>(
      { ok: true },
      {
        headers: {
          "Set-Cookie": commitAuthToken(token),
        },
      },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to sign in.";
    const normalizedMessage = message.toLowerCase();

    if (/\b(email|e-mail)\b/.test(normalizedMessage)) {
      fieldErrors.email = message;
    }
    if (/\b(password|passphrase)\b/.test(normalizedMessage)) {
      fieldErrors.password = message;
    }

    return data<LoginActionResult>({ message, fieldErrors }, { status: 400 });
  }
}

export default LoginPage;
