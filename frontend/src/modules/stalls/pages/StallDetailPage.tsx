import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Star,
  Store,
} from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router";

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Spinner } from "~/components/ui/spinner";
import { getMenuItemsForStall, getStallById } from "../services/stall.service";
import type { MenuItem, Stall, StallListMeta } from "../types/stall.types";

const DEFAULT_MENU_LIMIT = 10;

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function StallDetailPage() {
  const { stall_id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const stallId = Number(stall_id);

  const [stall, setStall] = useState<Stall | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [meta, setMeta] = useState<StallListMeta>({
    page: 1,
    limit: DEFAULT_MENU_LIMIT,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuError, setMenuError] = useState<string | null>(null);

  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.min(
    100,
    Math.max(
      1,
      Number(searchParams.get("limit") ?? String(DEFAULT_MENU_LIMIT)) ||
        DEFAULT_MENU_LIMIT,
    ),
  );

  useEffect(() => {
    if (!Number.isFinite(stallId) || stallId <= 0) {
      setError("Invalid stall ID.");
      setLoading(false);
      return;
    }

    let active = true;

    async function loadStallData() {
      setLoading(true);
      setError(null);
      setMenuError(null);

      try {
        const stallResponse = await getStallById(stallId);
        if (!active) return;

        setStall(stallResponse.data);
      } catch (loadError) {
        if (!active) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load stall details.",
        );
        return;
      }

      try {
        const menuResponse = await getMenuItemsForStall(stallId, {
          page,
          limit,
        });

        if (!active) return;

        setMenuItems(menuResponse.data);
        setMeta(menuResponse.meta);
      } catch (menuLoadError) {
        if (!active) return;
        setMenuError(
          menuLoadError instanceof Error
            ? menuLoadError.message
            : "Unable to load menu items.",
        );
        setMenuItems([]);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadStallData();

    return () => {
      active = false;
    };
  }, [limit, page, stallId]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(meta.total / meta.limit || 1)),
    [meta.limit, meta.total],
  );

  function changePage(nextPage: number) {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(Math.max(1, nextPage)));
    setSearchParams(next, { replace: true });
  }

  function setMenuLimit(nextLimit: number) {
    const next = new URLSearchParams(searchParams);
    next.set(
      "limit",
      String(Math.max(1, Math.min(100, nextLimit || DEFAULT_MENU_LIMIT))),
    );
    next.set("page", "1");
    setSearchParams(next, { replace: true });
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-4 py-10">
        <div className="mx-auto max-w-5xl rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-3">
            <Spinner />
            <span>Loading stall details...</span>
          </div>
        </div>
      </main>
    );
  }

  if (error || !stall) {
    return (
      <main className="min-h-screen bg-background px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <Alert variant="destructive">
            <Store className="size-4" />
            <AlertTitle>Unable to load stall</AlertTitle>
            <AlertDescription>
              {error ?? "The requested stall could not be found."}
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Link to="/stall">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="size-4" />
                Back to stalls
              </Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/stall">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="size-4" />
              Back to stalls
            </Button>
          </Link>
        </div>

        <Card className="border-border/80 bg-card shadow-sm">
          <CardHeader className="gap-4 pb-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Store className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-semibold tracking-tight text-foreground">
                    {stall.name}
                  </CardTitle>
                  <p className="mt-1 text-sm uppercase tracking-[0.14em] text-muted-foreground">
                    {stall.category || "Uncategorized"}
                  </p>
                </div>
              </div>

              {stall.isPopular && (
                <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-amber-600">
                  Popular
                </span>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-5 pb-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-4" />
              <span>{stall.location || "Location not available"}</span>
            </div>

            <p className="max-w-3xl text-sm leading-6 text-foreground/80">
              {stall.description || "No description provided for this stall."}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-1.5 text-sm font-medium text-foreground">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                {Number(stall.avgRating).toFixed(1)} average rating
              </div>

              <div className="rounded-full border border-border bg-muted/30 px-3 py-1.5 text-sm text-muted-foreground">
                {stall.reviewCount} reviews
              </div>
            </div>
          </CardContent>
        </Card>

        <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Menu items
              </h2>
              <p className="text-sm text-muted-foreground">
                {meta.total} items available for this stall
              </p>
            </div>

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Per page</span>
              <select
                value={String(limit)}
                onChange={(event) => setMenuLimit(Number(event.target.value))}
                className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {[5, 10, 20, 50].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {menuError && (
            <Alert variant="destructive" className="mb-5">
              <Store className="size-4" />
              <AlertTitle>Unable to load menu</AlertTitle>
              <AlertDescription>{menuError}</AlertDescription>
            </Alert>
          )}

          {menuItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
              No menu items are currently available for this stall.
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {menuItems.map((item) => (
                  <Card
                    key={item.id}
                    className="border-border/80 bg-background/60"
                  >
                    <CardContent className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            {item.name}
                          </h3>
                          <p className="mt-1 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                            Stall menu
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] ${
                            item.isAvailable
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-red-500/10 text-red-600"
                          }`}
                        >
                          {item.isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </div>

                      <div className="text-base font-semibold text-foreground">
                        {currencyFormatter.format(item.price)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-3 border-t border-border/80 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {(meta.page - 1) * meta.limit + 1}–
                  {Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={meta.page <= 1}
                    onClick={() => changePage(meta.page - 1)}
                  >
                    <ChevronLeft className="size-4" />
                    Prev
                  </Button>

                  <div className="rounded-md border border-border bg-muted/25 px-3 py-1.5 text-sm font-medium text-foreground">
                    Page {meta.page} of {totalPages}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={meta.page >= totalPages}
                    onClick={() => changePage(meta.page + 1)}
                  >
                    Next
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
