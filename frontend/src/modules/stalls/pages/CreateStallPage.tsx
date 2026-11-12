import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, CircleAlert, Plus, Store } from "lucide-react";

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
import { BackendRequestError } from "../../../shared/lib/api-handler";
import { createStall } from "../services/stall.service";
import type { CreateStallInput } from "../types/stall.types";

const fields: Array<{
  name: keyof CreateStallInput;
  label: string;
  maxLength: number;
}> = [
  { name: "name", label: "Stall name", maxLength: 100 },
  { name: "category", label: "Category", maxLength: 50 },
  { name: "location", label: "Location", maxLength: 100 },
];

export function CreateStallPage({ authorized }: { authorized: boolean }) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof CreateStallInput, string>>
  >({});
  const [isForbidden, setIsForbidden] = useState(false);
  const forbidden = !authorized || isForbidden;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload: CreateStallInput = {
      name: String(formData.get("name") ?? "").trim(),
      category: String(formData.get("category") ?? "").trim(),
      location: String(formData.get("location") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim(),
    };
    const errors: Partial<Record<keyof CreateStallInput, string>> = {};

    if (payload.name.length < 3 || payload.name.length > 100) {
      errors.name = "Enter a stall name between 3 and 100 characters.";
    }
    if (payload.category.length > 50) {
      errors.category = "Category must be 50 characters or fewer.";
    }
    if (payload.location.length > 100) {
      errors.location = "Location must be 100 characters or fewer.";
    }
    if (payload.description.length > 1000) {
      errors.description = "Description must be 1000 characters or fewer.";
    }

    setFieldErrors(errors);
    setSubmitError(null);
    setIsForbidden(false);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await createStall(payload);
      navigate("/stall");
    } catch (error) {
      setIsForbidden(
        error instanceof BackendRequestError && error.responseStatus === 403,
      );
      setSubmitError(
        error instanceof Error ? error.message : "Unable to create the stall.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (forbidden) {
    return (
      <main className="app-page min-h-screen px-4 py-10 sm:px-6">
        <Card className="food-surface mx-auto w-full max-w-lg">
          <CardHeader>
            <CardTitle>403 Forbidden</CardTitle>
            <CardDescription>
              You do not have permission to create a stall.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link
              to="/stall"
              className={buttonVariants({ variant: "outline" })}
            >
              <ArrowLeft data-icon="inline-start" />
              Back to stalls
            </Link>
          </CardFooter>
        </Card>
      </main>
    );
  }

  return (
    <main className="app-page min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/stall"
          className={buttonVariants({ variant: "ghost", className: "mb-5" })}
        >
          <ArrowLeft data-icon="inline-start" />
          Back to stalls
        </Link>

        <Card className="food-surface overflow-hidden">
          <CardHeader className="border-b border-border/70 bg-secondary/35 sm:p-7">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/20">
              <Store aria-hidden="true" className="size-5" />
            </div>
            <CardTitle className="text-2xl">Add a stall</CardTitle>
            <CardDescription>
              Enter the details for the new stall.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {submitError && !isForbidden && (
              <Alert variant="destructive" className="mb-5">
                <CircleAlert />
                <AlertTitle>Unable to create stall</AlertTitle>
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <FieldGroup className="gap-5">
                {fields.map(({ name, label, maxLength }) => (
                  <Field key={name} data-invalid={Boolean(fieldErrors[name])}>
                    <FieldLabel htmlFor={name}>{label}</FieldLabel>
                    <Input
                      id={name}
                      name={name}
                      required={name === "name"}
                      minLength={name === "name" ? 3 : undefined}
                      maxLength={maxLength}
                      aria-invalid={Boolean(fieldErrors[name])}
                      disabled={isSubmitting}
                    />
                    {fieldErrors[name] && (
                      <FieldError>{fieldErrors[name]}</FieldError>
                    )}
                  </Field>
                ))}

                <Field data-invalid={Boolean(fieldErrors.description)}>
                  <FieldLabel htmlFor="description">Description</FieldLabel>
                  {/* No shadcn Textarea component is installed, so Tailwind styles the native control. */}
                  <textarea
                    id="description"
                    name="description"
                    maxLength={1000}
                    aria-invalid={Boolean(fieldErrors.description)}
                    disabled={isSubmitting}
                    className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  {fieldErrors.description && (
                    <FieldError>{fieldErrors.description}</FieldError>
                  )}
                </Field>

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Spinner data-icon="inline-start" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus data-icon="inline-start" />
                      Create stall
                    </>
                  )}
                </Button>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
