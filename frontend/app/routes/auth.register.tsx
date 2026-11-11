import { data, redirect } from "react-router";
import type { Route } from "./+types/auth.register";

import { RegisterPage } from "../../src/modules/auth/pages/RegisterPage";
import { registerCustomer } from "../../src/modules/auth/services/auth.service";
import type {
  RegisterActionResult,
  RegisterRequest,
} from "../../src/modules/auth/types/auth.types";
import { getAuthToken } from "../lib/auth-session.server";

export async function loader({ request }: Route.LoaderArgs) {
  if (getAuthToken(request)) {
    return redirect("/");
  }

  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const registration: RegisterRequest = {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    role: "customer",
  };
  const fieldErrors: NonNullable<RegisterActionResult["fieldErrors"]> = {};

  if (!registration.name.trim()) {
    fieldErrors.name = "Enter your name.";
  }

  if (!registration.email) {
    fieldErrors.email = "Enter your email address.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registration.email)) {
    fieldErrors.email = "Enter a valid email address.";
  }

  if (!registration.password) {
    fieldErrors.password = "Enter a password.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return data<RegisterActionResult>(
      { message: "Check the highlighted fields.", fieldErrors },
      { status: 400 },
    );
  }

  try {
    await registerCustomer(registration);
    return redirect("/");
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create your account.";
    const normalizedMessage = message.toLowerCase();

    if (/\b(name|full name)\b/.test(normalizedMessage)) {
      fieldErrors.name = message;
    }
    if (/\b(email|e-mail)\b/.test(normalizedMessage)) {
      fieldErrors.email = message;
    }
    if (/\b(password|passphrase)\b/.test(normalizedMessage)) {
      fieldErrors.password = message;
    }

    return data<RegisterActionResult>(
      { message, fieldErrors },
      { status: 400 },
    );
  }
}

export default RegisterPage;
