"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { ThemeToggle } from "@/components/theme-toggle";

type ImportanceLevel = "low" | "medium" | "high";

type PreferenceOption = {
  value: string;
  label: string;
  helper: string;
};

type QuizTopic = {
  id: string;
  title: string;
  prompt: string;
  description: string;
  preferencePrompt?: string;
  options?: PreferenceOption[];
};

type QuizAnswer = {
  importance: ImportanceLevel | null;
  preference: string | null;
};

const IMPORTANCE_CHOICES: { value: ImportanceLevel; label: string; helper: string }[] = [
  { value: "low", label: "Not a priority", helper: "I can adapt either way." },
  { value: "medium", label: "Nice to have", helper: "It would make a difference." },
  { value: "high", label: "Essential", helper: "I absolutely need this." },
];

const TOPICS: QuizTopic[] = [
  {
    id: "firearmLaws",
    title: "Local gun laws",
    prompt: "How important is it that the state aligns with your outlook on gun ownership?",
    description:
      "Our data tracks whether firearm regulations are permissive, moderate, or restrictive in each destination.",
    preferencePrompt: "Which style feels right for you?",
    options: [
      { value: "permissive", label: "More permissive", helper: "Prefer lenient carry and ownership rules." },
      { value: "moderate", label: "Some guardrails", helper: "Comfortable with a middle ground." },
      { value: "restrictive", label: "Stricter rules", helper: "Want stronger controls in place." },
    ],
  },
  {
    id: "marijuanaStatus",
    title: "Marijuana access",
    prompt: "How much does legal access to cannabis matter in your next home state?",
    description:
      "We categorize each location by recreational approval, medical programs, decriminalization, or prohibitions.",
    preferencePrompt: "What would you hope to find?",
    options: [
      { value: "recreational", label: "Recreational", helper: "Full access for adults." },
      { value: "medical", label: "Medical only", helper: "Comfortable with a card-based program." },
      { value: "decriminalized", label: "Decriminalized", helper: "Low enforcement priority is enough." },
      { value: "illegal", label: "No access needed", helper: "Access is not important to me." },
    ],
  },
  {
    id: "lgbtqScore",
    title: "LGBTQ+ inclusion",
    prompt: "How important is a strong LGBTQ+ safety and inclusion score to you or your family?",
    description:
      "Destinations include an LGBTQ+ equality index so you can gauge local protections and community support.",
    preferencePrompt: "Pick the atmosphere that feels most comfortable.",
    options: [
      { value: "high", label: "High scoring", helper: "Looking for inclusive policies and culture." },
      { value: "medium", label: "Balanced", helper: "Open to somewhere with mixed scores." },
      { value: "flexible", label: "Flexible", helper: "Score is less of a deciding factor." },
    ],
  },
  {
    id: "climate",
    title: "Daily climate",
    prompt: "How strongly do you feel about the temperature and weather where you retire?",
    description:
      "Weather profiles highlight rainfall, snowfall, sunshine, and climate summaries for each destination.",
    preferencePrompt: "Lean warmer, cooler, or keep it mild?",
    options: [
      { value: "warm", label: "Warm and sunny", helper: "Bring on the heat and sunshine." },
      { value: "mild", label: "Mild seasons", helper: "Prefer balanced seasons without extremes." },
      { value: "cool", label: "Cool and crisp", helper: "I enjoy chillier climates and snow." },
    ],
  },
  {
    id: "lifestyle",
    title: "Lifestyle pace",
    prompt: "How much does the everyday pace of life influence your decision?",
    description:
      "We track markers like tech hub status, density, and local culture to hint at city energy versus slower living.",
    preferencePrompt: "What rhythm sounds right?",
    options: [
      { value: "urban", label: "Urban or metro", helper: "Restaurants, tech jobs, and nightlife." },
      { value: "suburban", label: "Suburban mix", helper: "Access to amenities with room to breathe." },
      { value: "slow", label: "Slow living", helper: "Quieter towns, nature, and open space." },
    ],
  },
];

const MIN_ANSWERS_REQUIRED = 3;

const buildInitialAnswers = (): Record<string, QuizAnswer> => {
  const entries = TOPICS.map((topic) => [topic.id, { importance: null, preference: null }]);
  return Object.fromEntries(entries) as Record<string, QuizAnswer>;
};

export default function QuizPage() {
  const [answers, setAnswers] = useState<Record<string, QuizAnswer>>(() => buildInitialAnswers());
  const [showResults, setShowResults] = useState(false);

  const completed = useMemo(() => {
    return TOPICS.reduce(
      (count, topic) => (answers[topic.id]?.importance ? count + 1 : count),
      0,
    );
  }, [answers]);

  const readyForResults = completed >= MIN_ANSWERS_REQUIRED;

  useEffect(() => {
    if (!readyForResults) {
      setShowResults(false);
    }
  }, [readyForResults]);

  const handleImportance = (topicId: string, value: ImportanceLevel) => {
    setAnswers((current) => ({
      ...current,
      [topicId]: { ...current[topicId], importance: value },
    }));
  };

  const handlePreference = (topicId: string, value: string) => {
    setAnswers((current) => ({
      ...current,
      [topicId]: {
        ...current[topicId],
        preference: current[topicId].preference === value ? null : value,
      },
    }));
  };

  const reset = () => {
    setAnswers(buildInitialAnswers());
    setShowResults(false);
  };

  const handleShowResults = () => {
    if (readyForResults) {
      setShowResults(true);
    }
  };

  const summary = useMemo(() => {
    return TOPICS.map((topic) => {
      const answer = answers[topic.id];
      if (!answer || !answer.importance) {
        return {
          id: topic.id,
          title: topic.title,
          text: "You have not answered this one yet.",
        };
      }

      const importanceLabel = IMPORTANCE_CHOICES.find(
        (choice) => choice.value === answer.importance,
      )?.label;

      let preferenceText = "";
      if (topic.options && answer.preference) {
        const pref = topic.options.find((option) => option.value === answer.preference);
        if (pref) {
          preferenceText = ` You leaned toward "${pref.label}".`;
        }
      }

      const core = importanceLabel ? `${importanceLabel} importance.` : "Importance noted.";
      const text = preferenceText ? `${core}${preferenceText}` : core;

      return {
        id: topic.id,
        title: topic.title,
        text,
      };
    });
  }, [answers]);

  const resultsButtonClassName = readyForResults
    ? "rounded-full px-4 py-2 text-sm font-semibold text-white transition bg-[linear-gradient(120deg,var(--accent),var(--accent-secondary))] shadow-sm hover:shadow-md"
    : "rounded-full border border-dashed border-color-border/60 px-4 py-2 text-sm font-semibold text-muted-foreground transition";


  return (
    <main className="mx-auto max-w-5xl space-y-10 px-4 py-12">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Preference quiz</p>
          <h1 className="text-3xl font-semibold text-gradient">Tell us what matters most</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Answer in plain English: tap how vital each topic is and describe the vibe you are chasing. We will use your
            picks to steer recommendations inside the explorer.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-full border border-color-border/60 px-4 py-2 text-sm font-semibold transition hover:text-primary"
          >
            Back to explorer
          </Link>
          <ThemeToggle size="sm" />
        </div>
      </header>

      <section className="glass-panel p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{completed} of {TOPICS.length} topics answered</p>
            <p className="text-sm text-muted-foreground">No wrong answers - just tell the story of your ideal spot.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleShowResults}
              disabled={!readyForResults}
              aria-disabled={!readyForResults}
              className={resultsButtonClassName}
            >
              Show my results
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-full border border-color-border/60 px-4 py-2 text-sm font-semibold transition hover:text-primary"
            >
              Reset responses
            </button>
          </div>
        </div>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-color-border/40">
          <div
            className="h-full rounded-full bg-[linear-gradient(120deg,var(--accent),var(--accent-secondary))] transition-all"
            style={{ width: `${(completed / TOPICS.length) * 100}%` }}
            aria-hidden
          />
        </div>
      </section>

      <div className="space-y-6">
        {TOPICS.map((topic) => {
          const answer = answers[topic.id];
          return (
            <article key={topic.id} className="glass-panel space-y-5 p-6">
              <header className="space-y-2">
                <h2 className="text-2xl font-semibold text-primary">{topic.title}</h2>
                <p className="text-sm text-muted-foreground">{topic.description}</p>
              </header>

              <div className="space-y-3">
                <p className="text-sm font-medium text-secondary">{topic.prompt}</p>
                <div className="flex flex-wrap gap-2">
                  {IMPORTANCE_CHOICES.map((choice) => {
                    const isActive = answer.importance === choice.value;
                    return (
                      <button
                        key={choice.value}
                        type="button"
                        onClick={() => handleImportance(topic.id, choice.value)}
                        className={`min-w-[160px] rounded-full border px-4 py-2 text-left text-sm transition ${
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
              </div>

              {topic.options ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-secondary">{topic.preferencePrompt}</p>
                  <div className="flex flex-wrap gap-2">
                    {topic.options.map((option) => {
                      const isActive = answer.preference === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handlePreference(topic.id, option.value)}
                          className={`min-w-[160px] rounded-full border px-4 py-2 text-left text-sm transition ${
                            isActive
                              ? "border-transparent bg-color-muted text-primary shadow-sm"
                              : "border-color-border/60 text-muted-foreground hover:text-primary"
                          }`}
                          aria-pressed={isActive}
                        >
                          <span className="block font-semibold">{option.label}</span>
                          <span className="block text-xs opacity-80">{option.helper}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      <section className="glass-panel space-y-4 p-6">
        <h2 className="text-2xl font-semibold text-primary">Your story so far</h2>
        <p className="text-sm text-muted-foreground">
          These notes become the backbone for matching you with destinations. Adjust anytime - everything updates on the fly.
        </p>
        {showResults ? (
          <>
            <ul className="space-y-2">
              {summary.map((item) => (
                <li
                  key={item.id}
                  className="rounded-lg border border-color-border/50 bg-color-surface/40 px-4 py-3 text-sm"
                >
                  <span className="font-semibold text-primary">{item.title}:</span>{" "}
                  <span className="text-muted-foreground">{item.text}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-color-border/60 px-4 py-2 text-sm font-semibold transition hover:text-primary"
            >
              Explore destinations
            </Link>
          </>
        ) : (
          <div className="rounded-lg border border-dashed border-color-border/60 bg-color-surface/30 px-4 py-6 text-sm text-muted-foreground">
            Answer at least {MIN_ANSWERS_REQUIRED} topics, then press the Show my results button to generate your guidance summary.
          </div>
        )}
      </section>
    </main>
  );
}
