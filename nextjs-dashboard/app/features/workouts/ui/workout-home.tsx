"use client";

import Link from "next/link";
import {
  ArrowRightIcon,
  BoltIcon,
  BookOpenIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { archiveTemplate, duplicateTemplate, startWorkout } from "../actions";
import { useI18n } from "@/app/i18n/provider";

type TemplateSummary = { id: string; name: string; notes: string };

export function WorkoutHome({
  templates,
  activeSessionId,
}: {
  templates: TemplateSummary[];
  activeSessionId?: string;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [message, setMessage] = useState("");
  async function start(templateId?: string) {
    setMessage(t("Starting workout..."));
    const result = await startWorkout(templateId);
    if (!result.ok) return setMessage(t(result.error));
    router.push(`/workouts/sessions/${result.id}`);
  }
  return (
    <main className="mx-auto max-w-6xl space-y-8">
      <header className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 p-6 text-white shadow-lg sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-100">
          {t("Training hub")}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          {t("Workouts")}
        </h1>
        <p className="mt-2 max-w-xl text-blue-50">
          {t(
            "Plan a session, follow your targets, and keep your training moving.",
          )}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {activeSessionId ? (
            <Link
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-blue-700 shadow-sm hover:bg-blue-50"
              href={`/workouts/sessions/${activeSessionId}`}
            >
              <BoltIcon className="h-5 w-5" />
              {t("Resume active workout")}
            </Link>
          ) : (
            <button
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-blue-700 shadow-sm hover:bg-blue-50"
              onClick={() => start()}
            >
              <BoltIcon className="h-5 w-5" />
              {t("Start empty workout")}
            </button>
          )}
          <Link
            className="inline-flex items-center gap-2 rounded-xl border border-white/60 px-5 py-3 font-bold text-white hover:bg-white/10"
            href="/workouts/templates/new"
          >
            <PlusIcon className="h-5 w-5" />
            {t("Create template")}
          </Link>
        </div>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          className="group flex items-center gap-4 rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          href="/workouts/exercises"
        >
          <span className="rounded-xl bg-violet-100 p-3 text-violet-700">
            <BookOpenIcon className="h-6 w-6" />
          </span>
          <span className="grow">
            <span className="block font-bold text-gray-950">
              {t("Exercise library")}
            </span>
            <span className="text-sm text-gray-600">
              {t("Browse built-in movements or create your own.")}
            </span>
          </span>
          <ArrowRightIcon className="h-5 w-5 text-gray-400 transition group-hover:translate-x-1" />
        </Link>
        <Link
          className="group flex items-center gap-4 rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          href="/workouts/templates/new"
        >
          <span className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
            <PlusIcon className="h-6 w-6" />
          </span>
          <span className="grow">
            <span className="block font-bold text-gray-950">
              {t("Build a template")}
            </span>
            <span className="text-sm text-gray-600">
              {t("Turn your favorite exercises into a reusable plan.")}
            </span>
          </span>
          <ArrowRightIcon className="h-5 w-5 text-gray-400 transition group-hover:translate-x-1" />
        </Link>
      </div>
      <section aria-labelledby="templates-heading">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
              {t("Ready when you are")}
            </p>
            <h2
              id="templates-heading"
              className="text-2xl font-bold text-gray-950"
            >
              {t("Workout templates")}
            </h2>
          </div>
        </div>
        {templates.length ? (
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {templates.map((template) => (
              <li
                className="rounded-2xl border bg-white p-5 shadow-sm"
                key={template.id}
              >
                <h3 className="text-lg font-bold text-gray-950">
                  {template.name}
                </h3>
                {template.notes ? (
                  <p className="mt-1 text-sm text-gray-600">{template.notes}</p>
                ) : null}
                <div className="mt-5 flex flex-wrap gap-2 border-t pt-4">
                  <button
                    className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-300"
                    disabled={Boolean(activeSessionId)}
                    onClick={() => start(template.id)}
                  >
                    {t("Start")}
                  </button>
                  <Link
                    className="rounded-lg border px-3 py-2 font-semibold hover:bg-gray-50"
                    href={`/workouts/templates/${template.id}`}
                  >
                    {t("Edit")}
                  </Link>
                  <button
                    className="rounded-lg border px-3 py-2 font-semibold hover:bg-gray-50"
                    onClick={async () => {
                      const result = await duplicateTemplate(
                        template.id,
                        `${template.name} ${t("Copy")}`,
                      );
                      setMessage(
                        result.ok ? t("Template duplicated.") : t(result.error),
                      );
                      router.refresh();
                    }}
                  >
                    {t("Duplicate")}
                  </button>
                  <button
                    className="rounded-lg border border-red-200 px-3 py-2 font-semibold text-red-700 hover:bg-red-50"
                    onClick={async () => {
                      if (!confirm(t("Archive this template?"))) return;
                      const result = await archiveTemplate(template.id);
                      setMessage(
                        result.ok ? t("Template archived.") : t(result.error),
                      );
                      router.refresh();
                    }}
                  >
                    {t("Archive")}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl border border-dashed bg-white p-10 text-center">
            <h3 className="text-lg font-bold">
              {t("No workout templates yet.")}
            </h3>
            <p className="mt-2 text-gray-600">
              {t(
                "Create a template to make your next workout faster to start.",
              )}
            </p>
            <Link
              className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white"
              href="/workouts/templates/new"
            >
              {t("Create your first template")}
            </Link>
          </div>
        )}
      </section>
      <p aria-live="polite" className="font-medium text-gray-700">
        {message}
      </p>
    </main>
  );
}
