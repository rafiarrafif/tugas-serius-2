import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  CircleAlert,
  CheckCircle2,
  UserRoundPlus,
} from "lucide-react";
import { useNavigate } from "react-router";

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
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
import { BackendRequestError } from "../../../shared/lib/api-handler";
import { registerCustomer } from "../services/auth.service";
import type { RegisterRequest } from "../types/auth.types";

type RegistrationValues = Pick<RegisterRequest, "name" | "email" | "password">;
type RegistrationField = keyof RegistrationValues;
type RegistrationErrors = Partial<Record<RegistrationField, string>>;

const initialValues: RegistrationValues = {
  name: "",
  email: "",
  password: "",
};

function validateRegistration(values: RegistrationValues): RegistrationErrors {
  const errors: RegistrationErrors = {};

  if (!values.name.trim()) {
    errors.name = "Enter your name.";
  }

  if (!values.email.trim()) {
    errors.email = "Enter your email address.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.password) {
    errors.password = "Enter a password.";
  }

  return errors;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState(initialValues);
  const [backendErrors, setBackendErrors] = useState<RegistrationErrors>({});
  const [touched, setTouched] = useState<
    Partial<Record<RegistrationField, boolean>>
  >({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<
    { type: "success" | "error"; message: string } | undefined
  >();

  const errors = validateRegistration(values);
  const visibleErrors = Object.fromEntries(
    (
      Object.entries({ ...errors, ...backendErrors }) as [
        RegistrationField,
        string,
      ][]
    ).filter(
      ([field]) =>
        Boolean(backendErrors[field]) ||
        Boolean(errors[field] && (submitted || touched[field])),
    ),
  ) as RegistrationErrors;

  function updateField(field: RegistrationField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setBackendErrors((current) => ({ ...current, [field]: undefined }));
    setTouched((current) => ({ ...current, [field]: true }));
    setFeedback(undefined);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setBackendErrors({});
    setFeedback(undefined);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await registerCustomer({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        role: "customer",
      });
      toast.add({
        title: "Account created",
        description: "Your customer account is ready.",
        type: "success",
      });
      navigate("/");
    } catch (error) {
      const message =
        error instanceof BackendRequestError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Unable to create your account. Please try again.";
      const fieldErrors: RegistrationErrors = {};
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

      setBackendErrors(fieldErrors);
      setFeedback({
        type: "error",
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-gradient-to-br from-sky-50 via-background to-emerald-50 px-4 py-10 sm:px-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-primary"
      />
      <Card className="relative w-full max-w-md border-border/80 bg-card/95 shadow-xl shadow-foreground/5 backdrop-blur-sm">
        <CardHeader className="gap-4 px-6 pt-7 sm:px-8 sm:pt-8">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <UserRoundPlus aria-hidden="true" className="size-5" />
          </div>
          <div className="flex flex-col gap-1.5">
            <CardTitle className="text-2xl font-semibold">
              Create your account
            </CardTitle>
            <CardDescription>
              Enter your details to set up a customer account.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="px-6 sm:px-8">
          {feedback && (
            <Alert
              className="mb-5"
              variant={feedback.type === "error" ? "destructive" : "default"}
            >
              {feedback.type === "error" ? (
                <CircleAlert aria-hidden="true" />
              ) : (
                <CheckCircle2 aria-hidden="true" />
              )}
              <AlertTitle>
                {feedback.type === "error"
                  ? "Registration failed"
                  : "Account created"}
              </AlertTitle>
              <AlertDescription>{feedback.message}</AlertDescription>
            </Alert>
          )}

          <form noValidate onSubmit={handleSubmit}>
            <input type="hidden" name="role" value="customer" />
            <FieldGroup className="gap-4">
              <Field data-invalid={Boolean(visibleErrors.name)}>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                  id="name"
                  name="name"
                  autoComplete="name"
                  required
                  value={values.name}
                  aria-invalid={Boolean(visibleErrors.name)}
                  disabled={isSubmitting}
                  onChange={(event) => updateField("name", event.target.value)}
                />
                {visibleErrors.name && (
                  <FieldError>{visibleErrors.name}</FieldError>
                )}
              </Field>

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
                  autoComplete="new-password"
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
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight data-icon="inline-end" />
                  </>
                )}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>

        <CardFooter className="justify-center border-t border-border/70 px-6 py-4 text-center text-xs text-muted-foreground sm:px-8">
          Your account type is set to Customer.
        </CardFooter>
      </Card>
    </main>
  );
}
