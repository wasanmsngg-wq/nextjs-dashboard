"use client";

import Link from "next/link";
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
    <main className="space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-semibold">{t("Workouts")}</h1>
        <p className="text-gray-600">{t("Plan and complete your training.")}</p>
      </div>
      {activeSessionId ? (
        <Link
          className="inline-flex rounded bg-blue-600 px-4 py-3 font-medium text-white"
          href={`/workouts/sessions/${activeSessionId}`}
        >
          {t("Resume active workout")}
        </Link>
      ) : (
        <button
          className="rounded bg-blue-600 px-4 py-3 font-medium text-white"
          onClick={() => start()}
        >
          {t("Start empty workout")}
        </button>
      )}
      <div className="flex flex-wrap gap-3">
        <Link className="rounded border px-4 py-2" href="/workouts/exercises">
          {t("Manage exercises")}
        </Link>
        <Link
          className="rounded border px-4 py-2"
          href="/workouts/templates/new"
        >
          {t("Create template")}
        </Link>
      </div>
      <section aria-labelledby="templates-heading">
        <h2 id="templates-heading" className="mb-3 text-xl font-semibold">
          {t("Workout templates")}
        </h2>
        {templates.length ? (
          <ul className="grid gap-4 md:grid-cols-2">
            {templates.map((template) => (
              <li className="rounded-lg border bg-white p-4" key={template.id}>
                <h3 className="font-semibold">{template.name}</h3>
                {template.notes ? (
                  <p className="mt-1 text-sm text-gray-600">{template.notes}</p>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    className="rounded bg-blue-600 px-3 py-2 text-white"
                    disabled={Boolean(activeSessionId)}
                    onClick={() => start(template.id)}
                  >
                    {t("Start")}
                  </button>
                  <Link
                    className="rounded border px-3 py-2"
                    href={`/workouts/templates/${template.id}`}
                  >
                    {t("Edit")}
                  </Link>
                  <button
                    className="rounded border px-3 py-2"
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
                    className="rounded border border-red-300 px-3 py-2 text-red-700"
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
          <p>{t("No workout templates yet.")}</p>
        )}
      </section>
      <p aria-live="polite">{message}</p>
    </main>
  );
}
