"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import type { Destination } from "@/types/destination";

type ChoiceValue = "not" | "somewhat" | "extreme";

type Choice = {
  value: ChoiceValue;
  label: string;
  helper: string;
};

const CHOICES: Choice[] = [
  {
    value: "not",
    label: "Not at all important",
    helper: "Other factors matter more to me than the Second Amendment.",
  },
  {
    value: "somewhat",
    label: "Somewhat important",
    helper: "It plays a role, but I will trade it for the right location.",
  },
  {
    value: "extreme",
    label: "Extremely important",
    helper: "I want the strongest possible protections.",
  },
];

const RELAXED_GIFFORD_GRADES = new Set(["F", "D", "C"]);

function isAbortError(error: unknown): error is DOMException {
  return typeof DOMException !== "undefined" && error instanceof DOMException && error.name === "AbortError";
}

export default function QuizPage() {
  const [selection, setSelection] = useState<ChoiceValue | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const [destinations, setDestinations] = useState<Destination[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (selection) {
      setValidationMessage(null);
    }
  }, [selection]);

  useEffect(() => {
    if (!showResults || selection !== "extreme" || destinations || loading) {
      return;
    }

    let isActive = true;
    const controller = new AbortController();

    async function loadDestinations() {
      try {
        setLoading(true);
        setFetchError(null);
        const response = await fetch("/api/destinations", { signal: controller.signal });
        if (!response.ok) {
          throw new Error("Request failed");
        }
        const data = (await response.json()) as Destination[];
        if (isActive) {
          setDestinations(data);
        }
      } catch (error) {
        if (isAbortError(error)) {
          return;
        }
        if (isActive) {
          setFetchError("Unable to load destinations right now. Please try again.");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadDestinations();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [showResults, selection, destinations]);

  const filteredDestinations = useMemo(() => {
    if (selection !== "extreme" || !destinations) {
      return [];
    }

    return destinations.filter((destination) => {
      const grade = destination.giffordScore?.trim().toUpperCase() ?? "";
      const rating = grade.charAt(0);
      return RELAXED_GIFFORD_GRADES.has(rating);
    });
  }, [destinations, selection]);

  const resultsPreview = useMemo(() => filteredDestinations.slice(0, 12), [filteredDestinations]);
  const totalMatches = filteredDestinations.length;

  const handleChoiceClick = (value: ChoiceValue) => {
    setSelection((current) => (current === value ? null : value));
    setShowResults(false);
  };

  const handleShowResults = () => {
    if (!selection) {
      setValidationMessage("Pick an option above to see your results.");
      setShowResults(false);
      return;
    }
    setValidationMessage(null);
    setShowResults(true);
  };

  const handleReset = () => {
    setSelection(null);
    setShowResults(false);
    setValidationMessage(null);
  };

  return (
    <main className="mx-auto max-w-4xl space-y-10 px-4 py-12">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Preference quiz</p>
          <h1 className="text-3xl font-semibold text-gradient">Tell us how you feel about the Second Amendment</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Answer the single question below in plain English. We will surface destinations that line up with your view when you ask for the results.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-full border border-color-border/60 px-6 py-2 text-xs font-semibold transition hover:text-primary whitespace-nowrap"
          >
            Back to explorer
          </Link>
          <ThemeToggle size="sm" />
        </div>
      </header>

      <section className="glass-panel space-y-5 p-6">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold text-primary">How important is the Second Amendment to you?</h2>
          <p className="text-sm text-muted-foreground">Pick the option that best captures your comfort level with local firearm policy.</p>
        </header>
        <div className="flex flex-wrap gap-2">
          {CHOICES.map((choice) => {
            const isActive = selection === choice.value;
            return (
              <button
                key={choice.value}
                type="button"
                onClick={() => handleChoiceClick(choice.value)}
                className={`min-w-[200px] rounded-full border px-4 py-3 text-left text-sm transition ${
                  isActive
                    ? "border-transparent bg-[linear-gradient(120deg,var(--accent),var(--accent-secondary))] text-white shadow-sm"
                    : "border-color-border/60 text-muted-foreground hover:text-primary"
                }`}
                aria-pressed={isActive}
              >
                <span className="block font-semibold">{choice.label}</span>
                <span className="block text-xs opacity-80">{choice.helper}</span>
              </button>
            );
          })}
        </div>
        {validationMessage ? (
          <p className="text-sm font-medium text-red-400">{validationMessage}</p>
        ) : null}
      </section>

      <section className="glass-panel space-y-4 p-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-primary">Results</h2>
          <p className="text-sm text-muted-foreground">
            Your answer guides which destinations we highlight. Tap the button below whenever you are ready.
          </p>
        </div>

        <div className="space-y-3">
          {showResults ? (
            selection === "extreme" ? (
              <div className="space-y-3">
                {loading ? (
                  <p className="text-sm text-muted-foreground">Loading destinations that match your preference...</p>
                ) : fetchError ? (
                  <p className="text-sm text-red-400">{fetchError}</p>
                ) : resultsPreview.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Showing {resultsPreview.length} of {totalMatches} matches with relaxed Giffords grades (F, D, or C).
                    </p>
                    <ul className="space-y-2">
                      {resultsPreview.map((destination) => (
                        <li
                          key={destination.id}
                          className="rounded-lg border border-color-border/50 bg-color-surface/40 px-4 py-3 text-sm"
                        >
                          <span className="font-semibold text-primary">
                            {destination.city}, {destination.state}
                          </span>
                          <span className="ml-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                            Giffords grade {destination.giffordScore || "N/A"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    None of the tracked destinations match that profile yet. Add more locations to the data store and try again.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Focus on other lifestyle factors such as taxes, benefits, and culture. When the Second Amendment is less critical, the full explorer is your best guide.
              </p>
            )
          ) : (
            <p className="text-sm text-muted-foreground">
              Select an answer above and press Show my results to see how it shapes your destination list.
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-color-border/50 pt-4">
          <button
            type="button"
            onClick={handleShowResults}
            className="rounded-full bg-[linear-gradient(120deg,var(--accent),var(--accent-secondary))] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
          >
            Show my results
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-full border border-color-border/60 px-4 py-2 text-sm font-semibold transition hover:text-primary"
          >
            Reset quiz
          </button>
          <Link
            href="/"
            className="rounded-full border border-color-border/60 px-4 py-2 text-sm font-semibold transition hover:text-primary"
          >
            Explore destinations
          </Link>
        </div>
      </section>
    </main>
  );
}
