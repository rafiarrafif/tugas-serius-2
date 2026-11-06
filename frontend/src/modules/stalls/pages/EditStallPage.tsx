import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, CircleAlert, Save, Store } from "lucide-react";
import { Link, useNavigate } from "react-router";

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
import { Field, FieldGroup, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Spinner } from "~/components/ui/spinner";
import { BackendRequestError } from "../../../shared/lib/api-handler";
import { updateStall } from "../services/stall.service";
import type { CreateStallInput, Stall } from "../types/stall.types";

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
  statusCode,
}: {
  stall: Stall | null;
  authorized: boolean;
  statusCode: number;
}) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isForbidden, setIsForbidden] = useState(false);
  const forbidden = !authorized || isForbidden;
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const stallId = stall?.id;
    if (!stallId) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setIsForbidden(false);

    try {
      await updateStall(stallId, values);
      navigate(`/stall/${stallId}`);
    } catch (error) {
      setIsForbidden(
        error instanceof BackendRequestError && error.responseStatus === 403,
      );
      setSubmitError(
        error instanceof Error ? error.message : "Unable to update the stall.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!stall) {
    const isUnauthorized = statusCode === 401;

    return (
      <main className="app-page min-h-screen px-4 py-10 sm:px-6">
        <Card className="food-surface mx-auto w-full max-w-lg">
          <CardHeader>
            <CardTitle>
              {isUnauthorized ? "401 Unauthorized" : "404 Not found"}
            </CardTitle>
            <CardDescription>
              {isUnauthorized
                ? "Please sign in to edit this stall."
                : "The stall you are trying to edit does not exist."}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link
              to={isUnauthorized ? "/auth/login" : "/stall"}
              className={buttonVariants({ variant: "outline" })}
            >
              <ArrowLeft data-icon="inline-start" />
              {isUnauthorized ? "Sign in" : "Back to stalls"}
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
            {submitError && !isForbidden && (
              <Alert variant="destructive" className="mb-5">
                <CircleAlert />
                <AlertTitle>Unable to update stall</AlertTitle>
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <FieldGroup className="gap-5">
                {fields.map(({ name, label, maxLength }) => (
                  <Field key={name}>
                    <FieldLabel htmlFor={name}>{label}</FieldLabel>
                    <Input
                      id={name}
                      name={name}
                      required={name === "name"}
                      minLength={name === "name" ? 3 : undefined}
                      maxLength={maxLength}
                      value={values[name]}
                      disabled={isSubmitting}
                      onChange={(event) =>
                        setValues((current) => ({
                          ...current,
                          [name]: event.target.value,
                        }))
                      }
                    />
                  </Field>
                ))}

                <Field>
                  <FieldLabel htmlFor="description">Description</FieldLabel>
                  <textarea
                    id="description"
                    name="description"
                    maxLength={1000}
                    value={values.description}
                    disabled={isSubmitting}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                  />
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
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
