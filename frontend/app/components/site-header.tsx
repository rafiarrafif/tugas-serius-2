import { useEffect, useRef, useState } from "react";
import { Form, Link } from "react-router";
import { cn } from "cn";
import { Utensils } from "lucide-react";

import { Button } from "~/components/ui/button";
import type { AccountProfile } from "../lib/auth-session.server";

const profileImageUrl =
  "https://api.dicebear.com/7.x/adventurer/svg?seed=uns-food-court-user";

export function SiteHeader({
  isAuthenticated,
  account,
}: {
  isAuthenticated: boolean;
  account: AccountProfile | null;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!menuRef.current) {
        return;
      }

      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 shadow-[0_4px_18px_-16px_var(--foreground)] backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="group flex items-center gap-2.5 text-lg font-semibold tracking-tight text-foreground transition hover:text-primary"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/20 transition group-hover:-rotate-3">
            <Utensils aria-hidden="true" className="size-4" />
          </span>
          <span>UNS Food Court</span>
        </Link>

        {isAuthenticated ? (
          <div ref={menuRef} className="relative">
            <button
              type="button"
              aria-label="Open user menu"
              onClick={() => setMenuOpen((current) => !current)}
              className="flex items-center rounded-full border border-border bg-card p-0.5 shadow-sm transition hover:border-primary/40 hover:shadow-md"
            >
              <img
                src={profileImageUrl}
                alt="User avatar"
                className="h-9 w-9 rounded-full object-cover"
              />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-popover p-2 shadow-xl shadow-foreground/10">
                {account && (
                  <div className="mb-1 border-b border-border px-3 py-2.5">
                    <p className="truncate text-sm font-semibold text-popover-foreground">
                      {account.name}
                    </p>
                    <p className="mt-0.5 break-all text-xs text-muted-foreground">
                      {account.email}
                    </p>
                    <p className="mt-2 inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium capitalize text-muted-foreground">
                      {account.role}
                    </p>
                  </div>
                )}
                <Form method="post" action="/logout">
                  <button
                    type="submit"
                    className={cn(
                      "flex w-full items-center justify-start rounded-md px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted",
                    )}
                  >
                    Logout
                  </button>
                </Form>
              </div>
            )}
          </div>
        ) : (
          <Link to="/auth/login">
            <Button variant="default" size="sm">
              Login
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
