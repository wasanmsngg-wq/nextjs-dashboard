"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  saveExerciseCategory,
  setExerciseCategoryArchived,
} from "@/app/features/admin/actions";
import { useI18n } from "@/app/i18n/provider";
import { Button } from "@/app/ui/atoms/button";
import { Surface } from "@/app/ui/atoms/surface";
import { Dialog } from "@/app/ui/molecules/dialog";
import { Toast, type ToastNotice } from "@/app/ui/molecules/toast";

export type CategoryAdminView = {
  key: string;
  nameEn: string;
  nameTh: string;
  sortOrder: number;
  archived: boolean;
};

export function CategoryManager({
  categories,
}: {
  categories: CategoryAdminView[];
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [editing, setEditing] = useState<CategoryAdminView>();
  const [saving, setSaving] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<CategoryAdminView>();
  const [archivePending, setArchivePending] = useState(false);
  const [notice, setNotice] = useState<ToastNotice | null>(null);

  function notify(type: ToastNotice["type"], message: string) {
    setNotice({ id: Date.now(), type, message });
  }

  return (
    <div className="space-y-6">
      <Surface
        as="section"
        className="space-y-5"
        aria-labelledby="category-form-title"
      >
        <div>
          <h2
            id="category-form-title"
            className="text-xl font-bold text-slate-950"
          >
            {editing ? t("Edit category") : t("Create category")}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {t("Category names appear in English and Thai exercise forms.")}
          </p>
        </div>
        <form
          key={editing?.key ?? "new-category"}
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={async (event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const data = new FormData(form);
            setSaving(true);
            const result = await saveExerciseCategory({
              key: data.get("key"),
              nameEn: data.get("nameEn"),
              nameTh: data.get("nameTh"),
              sortOrder: data.get("sortOrder"),
            });
            setSaving(false);
            notify(
              result.ok ? "success" : "error",
              t(result.ok ? "Category saved." : result.error),
            );
            if (result.ok) {
              setEditing(undefined);
              form.reset();
              router.refresh();
            }
          }}
        >
          <Field
            label={t("Category key")}
            hint={t("Lowercase letters, numbers, and hyphens only.")}
          >
            <input
              className="input"
              name="key"
              defaultValue={editing?.key}
              disabled={Boolean(editing)}
              maxLength={40}
              pattern="[a-z][a-z0-9-]*"
              required
            />
            {editing ? (
              <input type="hidden" name="key" value={editing.key} />
            ) : null}
          </Field>
          <Field label={t("Sort order")}>
            <input
              className="input"
              name="sortOrder"
              type="number"
              min={0}
              max={999}
              defaultValue={editing?.sortOrder ?? 100}
              required
            />
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
          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <Button htmlType="submit" loading={saving}>
              {editing ? t("Save changes") : t("Create category")}
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
        aria-label={t("Exercise categories")}
      >
        {categories.map((category) => (
          <Surface as="li" key={category.key} className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  {category.nameEn}
                </h2>
                <p className="text-slate-600" lang="th">
                  {category.nameTh}
                </p>
              </div>
              <p className="text-sm font-semibold text-blue-700">
                {category.archived ? t("Archived") : t("Active")}
              </p>
            </div>
            <p className="text-sm text-slate-600">
              {t("Key")}: <code>{category.key}</code> · {t("Sort order")}:{" "}
              {category.sortOrder}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => setEditing(category)}>
                {t("Edit")}
              </Button>
              <Button
                variant={category.archived ? "secondary" : "danger"}
                disabled={category.key === "other"}
                onClick={() => setArchiveTarget(category)}
              >
                {category.archived ? t("Restore") : t("Archive")}
              </Button>
            </div>
          </Surface>
        ))}
      </ul>
      <Dialog
        open={Boolean(archiveTarget)}
        title={t(
          archiveTarget?.archived
            ? "Restore this category?"
            : "Archive this category?",
        )}
        confirmLabel={t(archiveTarget?.archived ? "Restore" : "Archive")}
        cancelLabel={t("Cancel")}
        confirmVariant={archiveTarget?.archived ? "primary" : "danger"}
        loading={archivePending}
        onCancel={() => setArchiveTarget(undefined)}
        onConfirm={async () => {
          if (!archiveTarget) return;
          setArchivePending(true);
          const result = await setExerciseCategoryArchived(
            archiveTarget.key,
            !archiveTarget.archived,
          );
          setArchivePending(false);
          notify(
            result.ok ? "success" : "error",
            t(result.ok ? "Category updated." : result.error),
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
              ? "The category will be available in exercise forms again."
              : "Archived categories remain on existing exercise records but cannot be selected for new master exercises.",
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
