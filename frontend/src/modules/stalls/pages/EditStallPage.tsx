import { useEffect, useState } from "react";
import { ArrowLeft, CircleAlert, Save, Store } from "lucide-react";
import { Link, useFetcher } from "react-router";

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
  Stall,
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

export function EditStallPage({
  stall,
  authorized,
}: {
  stall: Stall | null;
  authorized: boolean;
}) {
  const fetcher = useFetcher<CreateStallActionResult>();
  const actionResult = fetcher.data;
  const forbidden = !authorized || actionResult?.forbidden === true;
  const isSubmitting = fetcher.state !== "idle";
  const [values, setValues] = useState<CreateStallInput>({
    name: stall?.name ?? "",
    category: stall?.category ?? "",
    location: stall?.location ?? "",
    description: stall?.description ?? "",
  });

  useEffect(() => {
    if (!stall) {
      return;
    }

    setValues({
      name: stall.name,
      category: stall.category ?? "",
      location: stall.location ?? "",
      description: stall.description ?? "",
    });
  }, [stall]);

  if (!stall) {
    return (
      <main className="app-page min-h-screen px-4 py-10 sm:px-6">
        <Card className="food-surface mx-auto w-full max-w-lg">
          <CardHeader>
            <CardTitle>404 Not found</CardTitle>
            <CardDescription>
              The stall you are trying to edit does not exist.
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

  if (forbidden) {
    return (
      <main className="app-page min-h-screen px-4 py-10 sm:px-6">
        <Card className="food-surface mx-auto w-full max-w-lg">
          <CardHeader>
            <CardTitle>403 Forbidden</CardTitle>
            <CardDescription>
              You do not have permission to edit this stall.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link
              to={`/stall/${stall.id}`}
              className={buttonVariants({ variant: "outline" })}
            >
              <ArrowLeft data-icon="inline-start" />
              Back to stall
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
          to={`/stall/${stall.id}`}
          className={buttonVariants({ variant: "ghost", className: "mb-5" })}
        >
          <ArrowLeft data-icon="inline-start" />
          Back to stall
        </Link>

        <Card className="food-surface overflow-hidden">
          <CardHeader className="border-b border-border/70 bg-secondary/35 sm:p-7">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/20">
              <Store aria-hidden="true" className="size-5" />
            </div>
            <CardTitle className="text-2xl">Edit stall</CardTitle>
            <CardDescription>
              Update the details for this stall.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {actionResult?.message && !actionResult.forbidden && (
              <Alert variant="destructive" className="mb-5">
                <CircleAlert />
                <AlertTitle>Unable to update stall</AlertTitle>
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
                      value={values[name]}
                      aria-invalid={Boolean(actionResult?.fieldErrors?.[name])}
                      disabled={isSubmitting}
                      onChange={(event) =>
                        setValues((current) => ({
                          ...current,
                          [name]: event.target.value,
                        }))
                      }
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
                  <textarea
                    id="description"
                    name="description"
                    maxLength={1000}
                    value={values.description}
                    aria-invalid={Boolean(
                      actionResult?.fieldErrors?.description,
                    )}
                    disabled={isSubmitting}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
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
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save data-icon="inline-start" />
                      Save changes
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
