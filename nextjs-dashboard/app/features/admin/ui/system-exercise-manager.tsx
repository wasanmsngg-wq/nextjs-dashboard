"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { equipmentSuggestions, type TrackingMode } from "@/app/domain";
import {
  saveSystemExercise,
  setSystemExerciseArchived,
} from "@/app/features/admin/actions";
import { useI18n } from "@/app/i18n/provider";
import { Button } from "@/app/ui/atoms/button";
import { Surface } from "@/app/ui/atoms/surface";
import { Dialog } from "@/app/ui/molecules/dialog";
import { Toast, type ToastNotice } from "@/app/ui/molecules/toast";

export type SystemExerciseAdminView = {
  id: string;
  systemKey: string;
  nameEn: string;
  nameTh: string;
  trackingMode: TrackingMode;
  category: string;
  equipment: string;
  archived: boolean;
};

export function SystemExerciseManager({
  exercises,
  categories,
}: {
  exercises: SystemExerciseAdminView[];
  categories: {
    key: string;
    name: string;
    archived: boolean;
  }[];
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [editing, setEditing] = useState<SystemExerciseAdminView>();
  const [saving, setSaving] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<SystemExerciseAdminView>();
  const [archivePending, setArchivePending] = useState(false);
  const [notice, setNotice] = useState<ToastNotice | null>(null);
  const activeCategories = categories.filter(
    (category) => !category.archived || category.key === editing?.category,
  );
  const categoryNames = new Map(
    categories.map((item) => [item.key, item.name]),
  );

  function notify(type: ToastNotice["type"], message: string) {
    setNotice({ id: Date.now(), type, message });
  }

  return (
    <div className="space-y-6">
      <Surface
        as="section"
        className="space-y-5"
        aria-labelledby="system-exercise-form-title"
      >
        <div>
          <h2
            id="system-exercise-form-title"
            className="text-xl font-bold text-slate-950"
          >
            {editing ? t("Edit system exercise") : t("Create system exercise")}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {t(
              "System exercises are bilingual and available to every registered user.",
            )}
          </p>
        </div>
        <form
          key={editing?.id ?? "new-system-exercise"}
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={async (event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const data = new FormData(form);
            setSaving(true);
            const result = await saveSystemExercise({
              id: editing?.id,
              systemKey: data.get("systemKey"),
              nameEn: data.get("nameEn"),
              nameTh: data.get("nameTh"),
              trackingMode: data.get("trackingMode"),
              category: data.get("category"),
              equipment: data.get("equipment"),
            });
            setSaving(false);
            notify(
              result.ok ? "success" : "error",
              t(result.ok ? "System exercise saved." : result.error),
            );
            if (result.ok) {
              setEditing(undefined);
              form.reset();
              router.refresh();
            }
          }}
        >
          <Field
            label={t("System key")}
            hint={t(
              "Stable lowercase identifier; it cannot be changed after creation.",
            )}
          >
            <input
              className="input"
              name="systemKey"
              defaultValue={editing?.systemKey}
              disabled={Boolean(editing)}
              maxLength={80}
              pattern="[a-z][a-z0-9-]*"
              required
            />
            {editing ? (
              <input type="hidden" name="systemKey" value={editing.systemKey} />
            ) : null}
          </Field>
          <Field label={t("Tracking mode")}>
            <select
              className="input"
              name="trackingMode"
              defaultValue={editing?.trackingMode ?? "reps_load"}
            >
              <option value="reps_load">{t("Repetitions and load")}</option>
              <option value="reps">{t("Repetitions only")}</option>
              <option value="duration">{t("Duration only")}</option>
              <option value="distance_duration">
                {t("Distance and duration")}
              </option>
            </select>
          </Field>
          <Field label={t("English name")}>
            <input
              className="input"
              name="nameEn"
              defaultValue={editing?.nameEn}
              maxLength={80}
              required
            />
          </Field>
          <Field label={t("Thai name")}>
            <input
              className="input"
              name="nameTh"
              defaultValue={editing?.nameTh}
              maxLength={80}
              lang="th"
              required
            />
          </Field>
          <Field label={t("Category")}>
            <select
              className="input"
              name="category"
              defaultValue={editing?.category ?? activeCategories[0]?.key}
              required
            >
              {activeCategories.map((category) => (
                <option key={category.key} value={category.key}>
                  {category.name}
                  {category.archived ? ` (${t("Archived")})` : ""}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label={t("Equipment")}
            hint={t("Choose a suggestion or type your own equipment.")}
          >
            <input
              className="input"
              name="equipment"
              list="admin-equipment-suggestions"
              defaultValue={editing?.equipment}
              maxLength={80}
            />
            <datalist id="admin-equipment-suggestions">
              {equipmentSuggestions.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </Field>
          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <Button
              htmlType="submit"
              loading={saving}
              disabled={!activeCategories.length}
            >
              {editing ? t("Save changes") : t("Create system exercise")}
            </Button>
            {editing ? (
              <Button variant="secondary" onClick={() => setEditing(undefined)}>
                {t("Cancel")}
              </Button>
            ) : null}
          </div>
        </form>
      </Surface>

      <ul
        className="grid gap-4 md:grid-cols-2"
        aria-label={t("System exercises")}
      >
        {exercises.map((exercise) => (
          <Surface as="li" key={exercise.id} className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  {exercise.nameEn}
                </h2>
                <p className="text-slate-600" lang="th">
                  {exercise.nameTh}
                </p>
              </div>
              <p className="text-sm font-semibold text-blue-700">
                {exercise.archived ? t("Archived") : t("Active")}
              </p>
            </div>
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-semibold text-slate-950">
                  {t("Category")}
                </dt>
                <dd className="text-slate-600">
                  {categoryNames.get(exercise.category) ?? exercise.category}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-950">
                  {t("Tracking mode")}
                </dt>
                <dd className="text-slate-600">
                  {t(
                    exercise.trackingMode === "reps_load"
                      ? "Repetitions and load"
                      : exercise.trackingMode === "reps"
                        ? "Repetitions only"
                        : exercise.trackingMode === "duration"
                          ? "Duration only"
                          : "Distance and duration",
                  )}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-950">
                  {t("Equipment")}
                </dt>
                <dd className="text-slate-600">{exercise.equipment || "—"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-950">
                  {t("System key")}
                </dt>
                <dd className="break-all text-slate-600">
                  <code>{exercise.systemKey}</code>
                </dd>
              </div>
            </dl>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => setEditing(exercise)}>
                {t("Edit")}
              </Button>
              <Button
                variant={exercise.archived ? "secondary" : "danger"}
                onClick={() => setArchiveTarget(exercise)}
              >
                {exercise.archived ? t("Restore") : t("Archive")}
              </Button>
            </div>
          </Surface>
        ))}
      </ul>
      <Dialog
        open={Boolean(archiveTarget)}
        title={t(
          archiveTarget?.archived
            ? "Restore this system exercise?"
            : "Archive this system exercise?",
        )}
        confirmLabel={t(archiveTarget?.archived ? "Restore" : "Archive")}
        cancelLabel={t("Cancel")}
        confirmVariant={archiveTarget?.archived ? "primary" : "danger"}
        loading={archivePending}
        onCancel={() => setArchiveTarget(undefined)}
        onConfirm={async () => {
          if (!archiveTarget) return;
          setArchivePending(true);
          const result = await setSystemExerciseArchived(
            archiveTarget.id,
            !archiveTarget.archived,
          );
          setArchivePending(false);
          notify(
            result.ok ? "success" : "error",
            t(result.ok ? "System exercise updated." : result.error),
          );
          if (result.ok) {
            setArchiveTarget(undefined);
            router.refresh();
          }
        }}
      >
        <p className="text-slate-600">
          {t(
            archiveTarget?.archived
              ? "The exercise will be available to registered users again."
              : "Existing templates and workout history keep their references and snapshots.",
          )}
        </p>
      </Dialog>
      <Toast notice={notice} />
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="font-semibold text-slate-800">
      {label}
      <span className="mt-1 block">{children}</span>
      {hint ? (
        <span className="mt-1 block text-xs font-normal text-slate-500">
          {hint}
        </span>
      ) : null}
    </label>
  );
}
