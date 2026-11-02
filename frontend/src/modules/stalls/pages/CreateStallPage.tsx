import { useFetcher, Link } from "react-router";
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
import type {
  CreateStallActionResult,
  CreateStallInput,
} from "../types/stall.types";

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
  const fetcher = useFetcher<CreateStallActionResult>();
  const actionResult = fetcher.data;
  const forbidden = !authorized || actionResult?.forbidden === true;
  const isSubmitting = fetcher.state !== "idle";

  if (forbidden) {
    return (
      <main className="min-h-screen bg-background px-4 py-10 sm:px-6">
        <Card className="mx-auto w-full max-w-lg">
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
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/stall"
          className={buttonVariants({ variant: "ghost", className: "mb-5" })}
        >
          <ArrowLeft data-icon="inline-start" />
          Back to stalls
        </Link>

        <Card>
          <CardHeader>
            <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Store aria-hidden="true" className="size-5" />
            </div>
            <CardTitle className="text-2xl">Add a stall</CardTitle>
            <CardDescription>
              Enter the details for the new stall.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {actionResult?.message && !actionResult.forbidden && (
              <Alert variant="destructive" className="mb-5">
                <CircleAlert />
                <AlertTitle>Unable to create stall</AlertTitle>
                <AlertDescription>{actionResult.message}</AlertDescription>
              </Alert>
            )}

            <fetcher.Form method="post">
              <FieldGroup className="gap-5">
                {fields.map(({ name, label, maxLength }) => (
                  <Field
                    key={name}
                    data-invalid={Boolean(actionResult?.fieldErrors?.[name])}
                  >
                    <FieldLabel htmlFor={name}>{label}</FieldLabel>
                    <Input
                      id={name}
                      name={name}
                      required={name === "name"}
                      minLength={name === "name" ? 3 : undefined}
                      maxLength={maxLength}
                      aria-invalid={Boolean(actionResult?.fieldErrors?.[name])}
                      disabled={isSubmitting}
                    />
                    {actionResult?.fieldErrors?.[name] && (
                      <FieldError>{actionResult.fieldErrors[name]}</FieldError>
                    )}
                  </Field>
                ))}

                <Field
                  data-invalid={Boolean(actionResult?.fieldErrors?.description)}
                >
                  <FieldLabel htmlFor="description">Description</FieldLabel>
                  {/* No shadcn Textarea component is installed, so Tailwind styles the native control. */}
                  <textarea
                    id="description"
                    name="description"
                    maxLength={1000}
                    aria-invalid={Boolean(
                      actionResult?.fieldErrors?.description,
                    )}
                    disabled={isSubmitting}
                    className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  {actionResult?.fieldErrors?.description && (
                    <FieldError>
                      {actionResult.fieldErrors.description}
                    </FieldError>
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
            </fetcher.Form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
