"use client";

import Link from "next/link";
import {
  ArrowRightIcon,
  BoltIcon,
  BookOpenIcon,
  ChartBarIcon,
  PlusIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { archiveTemplate, duplicateTemplate, startWorkout } from "../actions";
import { useI18n } from "@/app/i18n/provider";
import { Button, ButtonLink } from "@/app/ui/atoms/button";
import { Surface } from "@/app/ui/atoms/surface";
import { PageHeading } from "@/app/ui/molecules/page-heading";
import { Dialog } from "@/app/ui/molecules/dialog";
import { Toast, type ToastNotice } from "@/app/ui/molecules/toast";

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
  const [notice, setNotice] = useState<ToastNotice | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<TemplateSummary>();
  const [archivePending, setArchivePending] = useState(false);
  function notify(type: ToastNotice["type"], message: string) {
    setNotice({ id: Date.now(), type, message });
  }
  async function start(templateId?: string) {
    notify("info", t("Starting workout..."));
    const result = await startWorkout(templateId);
    if (!result.ok) {
      notify("error", t(result.error));
      return;
    }
    router.push(`/workouts/sessions/${result.id}`);
  }
  return (
    <main className="mx-auto max-w-6xl space-y-8">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 p-6 shadow-lg sm:p-8">
        <PageHeading
          actions={
            <>
              <ButtonLink
                className="border-white/60 text-white hover:!border-white hover:!text-white"
                href="/workouts/history/exercises"
                icon={<TrophyIcon className="h-5 w-5" />}
                variant="secondary"
              >
                {t("Personal bests")}
              </ButtonLink>
              <ButtonLink
                className="border-white/60 text-white hover:!border-white hover:!text-white"
                href="/workouts/history"
                icon={<ChartBarIcon className="h-5 w-5" />}
                variant="secondary"
              >
                {t("Workout history")}
              </ButtonLink>
              {activeSessionId ? (
                <ButtonLink
                  className="border-white bg-white text-blue-700"
                  href={`/workouts/sessions/${activeSessionId}`}
                  icon={<BoltIcon className="h-5 w-5" />}
                  variant="secondary"
                >
                  {t("Resume active workout")}
                </ButtonLink>
              ) : templates.length ? (
                <Button
                  className="border-white bg-white text-blue-700"
                  icon={<BoltIcon className="h-5 w-5" />}
                  onClick={() => start()}
                  variant="secondary"
                >
                  {t("Start empty workout")}
                </Button>
              ) : null}
              <ButtonLink
                className="border-white/60 text-white hover:!border-white hover:!text-white"
                href="/workouts/templates/new"
                icon={<PlusIcon className="h-5 w-5" />}
                variant="secondary"
              >
                {t("Create template")}
              </ButtonLink>
            </>
          }
          description={t(
            "Plan a session, follow your targets, and keep your training moving.",
          )}
          eyebrow={t("Training hub")}
          inverse
          title={t("Workouts")}
        />
      </div>
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
              <Surface as="li" key={template.id}>
                <h3 className="text-lg font-bold text-gray-950">
                  {template.name}
                </h3>
                {template.notes ? (
                  <p className="mt-1 text-sm text-gray-600">{template.notes}</p>
                ) : null}
                <div className="mt-5 flex flex-wrap gap-2 border-t pt-4">
                  <Button
                    disabled={Boolean(activeSessionId)}
                    onClick={() => start(template.id)}
                  >
                    {t("Start")}
                  </Button>
                  <ButtonLink
                    href={`/workouts/templates/${template.id}`}
                    variant="secondary"
                  >
                    {t("Edit")}
                  </ButtonLink>
                  <Button
                    onClick={async () => {
                      const result = await duplicateTemplate(
                        template.id,
                        `${template.name} ${t("Copy")}`,
                      );
                      notify(
                        result.ok ? "success" : "error",
                        t(result.ok ? "Template duplicated." : result.error),
                      );
                      router.refresh();
                    }}
                    variant="secondary"
                  >
                    {t("Duplicate")}
                  </Button>
                  <Button
                    onClick={() => setArchiveTarget(template)}
                    variant="danger"
                  >
                    {t("Archive")}
                  </Button>
                </div>
              </Surface>
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
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Button
                icon={<BoltIcon className="h-5 w-5" />}
                onClick={() => start()}
              >
                {t("Start empty workout")}
              </Button>
              <ButtonLink href="/workouts/templates/new" variant="secondary">
                {t("Create your first template")}
              </ButtonLink>
            </div>
          </div>
        )}
      </section>
      <Toast notice={notice} />
      <Dialog
        open={Boolean(archiveTarget)}
        title={t("Archive this template?")}
        confirmLabel={t("Archive")}
        cancelLabel={t("Cancel")}
        confirmVariant="danger"
        loading={archivePending}
        onCancel={() => setArchiveTarget(undefined)}
        onConfirm={async () => {
          if (!archiveTarget) return;
          setArchivePending(true);
          const result = await archiveTemplate(archiveTarget.id);
          setArchivePending(false);
          notify(
            result.ok ? "success" : "error",
            t(result.ok ? "Template archived." : result.error),
          );
          if (result.ok) {
            setArchiveTarget(undefined);
            router.refresh();
          }
        }}
      />
    </main>
  );
}
