import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Plus,
  Search,
  Star,
  Store,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router";

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button, buttonVariants } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Spinner } from "~/components/ui/spinner";
import { getStalls } from "../services/stall.service";
import type { Stall, StallListMeta } from "../types/stall.types";

const DEFAULT_LIMIT = 10;

export function StallListPage({ canCreateStall }: { canCreateStall: boolean }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [meta, setMeta] = useState<StallListMeta>({
    page: 1,
    limit: DEFAULT_LIMIT,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.min(
    100,
    Math.max(
      1,
      Number(searchParams.get("limit") ?? String(DEFAULT_LIMIT)) ||
        DEFAULT_LIMIT,
    ),
  );
  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";

  const [searchInput, setSearchInput] = useState(search);
  const [categoryInput, setCategoryInput] = useState(category);
  const [limitInput, setLimitInput] = useState(String(limit));

  useEffect(() => {
    setSearchInput(search);
    setCategoryInput(category);
    setLimitInput(String(limit));
  }, [search, category, limit]);

  useEffect(() => {
    let active = true;

    async function loadStalls() {
      setLoading(true);
      setError(null);

      try {
        const response = await getStalls({
          search: search || undefined,
          category: category || undefined,
          page,
          limit,
        });

        if (!active) {
          return;
        }

        setStalls(response.data);
        setMeta(response.meta);
      } catch (loadError) {
        if (!active) {
          return;
        }

        const message =
          loadError instanceof Error
            ? loadError.message
            : "Unable to load stalls.";
        setError(message);
        setStalls([]);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadStalls();

    return () => {
      active = false;
    };
  }, [category, limit, page, search]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(meta.total / meta.limit || 1)),
    [meta.limit, meta.total],
  );

  function applyFilters(event?: React.FormEvent) {
    event?.preventDefault();

    const next = new URLSearchParams();

    if (searchInput.trim()) {
      next.set("search", searchInput.trim());
    }

    if (categoryInput.trim()) {
      next.set("category", categoryInput.trim());
    }

    const normalizedLimit = Math.min(
      100,
      Math.max(1, Number(limitInput) || DEFAULT_LIMIT),
    );
    next.set("limit", String(normalizedLimit));
    next.set("page", "1");

    setSearchParams(next, { replace: true });
  }

  function changePage(nextPage: number) {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(Math.max(1, nextPage)));
    setSearchParams(next, { replace: true });
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Browse stalls
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                Available stalls
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-border bg-muted/30 px-3 py-1 text-sm text-muted-foreground">
                {meta.total} total results
              </div>
              {canCreateStall && (
                <Link to="/create/stall" className={buttonVariants()}>
                  <Plus data-icon="inline-start" />
                  Add Stall
                </Link>
              )}
            </div>
          </div>

          <form
            onSubmit={applyFilters}
            className="grid gap-3 md:grid-cols-[1.7fr_1.2fr_0.8fr_auto] md:items-end"
          >
            <label className="flex flex-col gap-1.5 text-sm text-muted-foreground">
              <span>Search</span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search stall name"
                  className="pl-9"
                />
              </div>
            </label>

            <label className="flex flex-col gap-1.5 text-sm text-muted-foreground">
              <span>Category</span>
              <Input
                value={categoryInput}
                onChange={(event) => setCategoryInput(event.target.value)}
                placeholder="e.g. Makanan"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm text-muted-foreground">
              <span>Per page</span>
              <select
                value={limitInput}
                onChange={(event) => setLimitInput(event.target.value)}
                className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {[5, 10, 20, 50].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>

            <Button type="submit" className="h-8 whitespace-nowrap">
              Apply filters
            </Button>
          </form>
        </header>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <Search className="size-4" />
            <AlertTitle>Unable to load stalls</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex min-h-64 items-center justify-center rounded-2xl border border-dashed border-border bg-card/50">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Spinner />
              <span>Loading stalls...</span>
            </div>
          </div>
        ) : stalls.length === 0 ? (
          <Card className="border-dashed border-border/80 bg-card/60">
            <CardContent className="flex min-h-48 items-center justify-center p-8 text-center text-muted-foreground">
              No stalls match your current filters.
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {stalls.map((stall) => (
                <Card
                  key={stall.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/stall/${stall.id}`)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      navigate(`/stall/${stall.id}`);
                    }
                  }}
                  className="group cursor-pointer border-border/80 bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md"
                >
                  <CardHeader className="gap-3 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Store className="size-4" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-semibold leading-snug">
                            {stall.name}
                          </CardTitle>
                          <CardDescription className="mt-1 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                            {stall.category || "Uncategorized"}
                          </CardDescription>
                        </div>
                      </div>

                      {stall.isPopular && (
                        <span className="rounded-full bg-amber-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-600">
                          Popular
                        </span>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 pb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="size-4 shrink-0" />
                      <span>{stall.location || "Location not available"}</span>
                    </div>

                    <p className="min-h-12 text-sm leading-6 text-foreground/80">
                      {stall.description || "No description provided."}
                    </p>

                    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/25 px-3 py-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Star className="size-4 fill-amber-400 text-amber-400" />
                        {Number(stall.avgRating).toFixed(1)}
                      </div>

                      <div className="text-sm text-muted-foreground">
                        {stall.reviewCount} reviews
                      </div>
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
      </div>
    </main>
  );
}
