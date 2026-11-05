import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "react-router";

import { getAuthToken } from "./lib/auth-session.server";
import type { Route } from "./+types/root";
import { SiteHeader } from "~/components/site-header";
import { Toaster } from "~/components/ui/toast";
import "./app.css";

export async function loader({ request }: Route.LoaderArgs) {
  return {
    isAuthenticated: Boolean(getAuthToken(request)),
  };
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Toaster>{children}</Toaster>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { isAuthenticated } = useLoaderData<typeof loader>();

  return (
    <>
      <SiteHeader isAuthenticated={isAuthenticated} />
      <Outlet />
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="app-page min-h-[calc(100svh-4rem)] px-4 py-16 sm:px-6">
      <section className="food-surface mx-auto max-w-3xl rounded-[1.5rem] border p-6 shadow-lg shadow-foreground/5 sm:p-8">
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          {message}
        </h1>
        <p className="mt-2 text-muted-foreground">{details}</p>
        {stack && (
          <pre className="mt-4 w-full overflow-x-auto rounded-xl bg-muted p-4 text-sm">
            <code>{stack}</code>
          </pre>
        )}
      </section>
    </main>
  );
}
