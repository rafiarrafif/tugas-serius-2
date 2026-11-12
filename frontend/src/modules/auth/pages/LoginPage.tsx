import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, CircleAlert, LogIn } from "lucide-react";
import { Link, useFetcher, useNavigate } from "react-router";

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button, buttonVariants } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Spinner } from "~/components/ui/spinner";
import { toast } from "~/components/ui/toast";
import { getCurrentAccount, loginCustomer } from "../services/auth.service";
import type { LoginActionResult, LoginRequest } from "../types/auth.types";

type LoginField = keyof LoginRequest;
type LoginErrors = Partial<Record<LoginField, string>>;

const initialValues: LoginRequest = {
  email: "",
  password: "",
};

function validateLogin(values: LoginRequest): LoginErrors {
  const errors: LoginErrors = {};

  if (!values.email.trim()) {
    errors.email = "Enter your email address.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.password) {
    errors.password = "Enter your password.";
  }

  return errors;
}

export function LoginPage() {
  const navigate = useNavigate();
  const fetcher = useFetcher<LoginActionResult>();
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState<Partial<Record<LoginField, boolean>>>(
    {},
  );
  const [backendErrors, setBackendErrors] = useState<LoginErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const handledSuccess = useRef(false);
  const isSubmitting = isLoggingIn || fetcher.state !== "idle";

  const validationErrors = validateLogin(values);
  const visibleErrors: LoginErrors = {
    email:
      backendErrors.email ??
      (submitted || touched.email ? validationErrors.email : undefined),
    password:
      backendErrors.password ??
      (submitted || touched.password ? validationErrors.password : undefined),
  };

  function updateField(field: LoginField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setTouched((current) => ({ ...current, [field]: true }));
    setBackendErrors((current) => ({ ...current, [field]: undefined }));
    setErrorMessage(undefined);
  }

  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data) {
      return;
    }

    if (fetcher.data.ok && !handledSuccess.current) {
      handledSuccess.current = true;
      toast.add({
        title: "Signed in",
        description: "You are now signed in.",
        type: "success",
      });
      navigate("/");
      return;
    }

    setErrorMessage(fetcher.data.message);
    setBackendErrors(fetcher.data.fieldErrors ?? {});
  }, [fetcher.data, fetcher.state, navigate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setBackendErrors({});
    setErrorMessage(undefined);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsLoggingIn(true);
    try {
      const { token } = await loginCustomer({
        ...values,
        email: values.email.trim(),
      });
      await getCurrentAccount(token);
      fetcher.submit({ token }, { method: "post" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to sign in.";
      const normalizedMessage = message.toLowerCase();
      const errors: LoginErrors = {};

      if (/\b(email|e-mail)\b/.test(normalizedMessage)) {
        errors.email = message;
      }
      if (/\b(password|passphrase)\b/.test(normalizedMessage)) {
        errors.password = message;
      }

      setBackendErrors(errors);
      setErrorMessage(message);
    } finally {
      setIsLoggingIn(false);
    }
  }

  return (
    <main className="app-page flex min-h-svh items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      <Card className="food-surface relative w-full max-w-md overflow-hidden rounded-[1.5rem] shadow-xl shadow-foreground/5">
        <CardHeader className="gap-4 border-b border-border/70 bg-secondary/35 px-6 pt-7 pb-6 sm:px-8 sm:pt-8">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
            <LogIn aria-hidden="true" className="size-5" />
          </div>
          <div className="flex flex-col gap-1.5">
            <CardTitle className="text-2xl font-semibold">
              Welcome back
            </CardTitle>
            <CardDescription>
              Sign in with the email and password for your account.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="px-6 sm:px-8">
          {errorMessage && (
            <Alert className="mb-5" variant="destructive">
              <CircleAlert aria-hidden="true" />
              <AlertTitle>Unable to sign in</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <form noValidate onSubmit={handleSubmit}>
            <FieldGroup className="gap-4">
              <Field data-invalid={Boolean(visibleErrors.email)}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={values.email}
                  aria-invalid={Boolean(visibleErrors.email)}
                  disabled={isSubmitting}
                  onChange={(event) => updateField("email", event.target.value)}
                />
                {visibleErrors.email && (
                  <FieldError>{visibleErrors.email}</FieldError>
                )}
              </Field>

              <Field data-invalid={Boolean(visibleErrors.password)}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={values.password}
                  aria-invalid={Boolean(visibleErrors.password)}
                  disabled={isSubmitting}
                  onChange={(event) =>
                    updateField("password", event.target.value)
                  }
                />
                {visibleErrors.password && (
                  <FieldError>{visibleErrors.password}</FieldError>
                )}
              </Field>

              <Button
                className="mt-2 h-11 w-full"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Spinner data-icon="inline-start" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight data-icon="inline-end" />
                  </>
                )}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>

        <CardFooter className="flex-col gap-3 border-t border-border/70 bg-accent/25 px-6 py-4 text-center sm:px-8">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account yet?
          </p>
          <Link
            to="/auth/register"
            className={buttonVariants({
              variant: "outline",
              className: "w-full",
            })}
          >
            Create an account
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
