import { useEffect, useRef, useState } from "react";
import { Form, Link } from "react-router";
import { cn } from "cn";

import { Button } from "~/components/ui/button";

const profileImageUrl =
  "https://api.dicebear.com/7.x/adventurer/svg?seed=uns-food-court-user";

export function SiteHeader({ isAuthenticated }: { isAuthenticated: boolean }) {
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
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="text-lg font-semibold tracking-tight text-foreground transition hover:text-foreground/80"
        >
          UNS Food Court
        </Link>

        {isAuthenticated ? (
          <div ref={menuRef} className="relative">
            <button
              type="button"
              aria-label="Open user menu"
              onClick={() => setMenuOpen((current) => !current)}
              className="flex items-center rounded-full border border-border bg-background p-0.5 shadow-sm transition hover:border-foreground/20"
            >
              <img
                src={profileImageUrl}
                alt="User avatar"
                className="h-9 w-9 rounded-full object-cover"
              />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-40 rounded-xl border border-border bg-popover p-1 shadow-lg">
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
