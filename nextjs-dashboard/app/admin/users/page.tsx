import { loadAdminUsers } from "@/app/features/admin/data";
import { adminSearchSchema } from "@/app/features/admin/validation";
import { getTranslations } from "@/app/i18n/server";
import { EmptyState } from "@/app/ui/atoms/empty-state";
import { Surface } from "@/app/ui/atoms/surface";
import { BackNavigation } from "@/app/ui/molecules/back-navigation";
import { PageHeading } from "@/app/ui/molecules/page-heading";
import Search from "@/app/ui/molecules/search-field";

function formatDate(value: string | null, locale: string) {
  return value
    ? new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "—";
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const query = adminSearchSchema.parse((await searchParams).query ?? "");
  const [{ locale, t }, users] = await Promise.all([
    getTranslations(),
    loadAdminUsers(query),
  ]);
  return (
    <main className="mx-auto max-w-7xl space-y-6">
      <BackNavigation href="/admin">
        {t("Back to administration")}
      </BackNavigation>
      <PageHeading
        eyebrow={t("Administration")}
        title={t("Users")}
        description={t(
          "Review account verification, profile preferences, and activity totals. Account and admin-role changes remain trusted operations outside the app.",
        )}
      />
      <div className="max-w-2xl">
        <Search placeholder={t("Search users by email or display name...")} />
      </div>
      {users.length ? (
        <ul className="grid gap-4" aria-label={t("User accounts")}>
          {users.map((user) => (
            <Surface as="li" key={user.user_id} className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="break-words text-lg font-bold text-slate-950">
                    {user.display_name || user.email || t("Unnamed account")}
                  </h2>
                  <p className="break-all text-sm text-slate-600">
                    {user.email}
                  </p>
                </div>
                <p className="text-sm font-semibold text-blue-700">
                  {user.is_admin ? t("Administrator") : t("Registered user")}
                </p>
              </div>
              <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <dt className="font-semibold text-slate-950">
                    {t("Verified")}
                  </dt>
                  <dd className="text-slate-600">
                    {user.email_confirmed_at ? t("Yes") : t("No")}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-950">
                    {t("Last sign-in")}
                  </dt>
                  <dd className="text-slate-600">
                    {formatDate(user.last_sign_in_at, locale)}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-950">
                    {t("Workouts")}
                  </dt>
                  <dd className="text-slate-600">{user.workout_count}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-950">
                    {t("Custom exercises")}
                  </dt>
                  <dd className="text-slate-600">
                    {user.custom_exercise_count}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-950">
                    {t("Locale")}
                  </dt>
                  <dd className="text-slate-600">{user.locale}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-950">
                    {t("Timezone")}
                  </dt>
                  <dd className="break-words text-slate-600">
                    {user.timezone}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-950">{t("Units")}</dt>
                  <dd className="text-slate-600">{user.unit_system}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-950">
                    {t("Created")}
                  </dt>
                  <dd className="text-slate-600">
                    {formatDate(user.created_at, locale)}
                  </dd>
                </div>
              </dl>
            </Surface>
          ))}
        </ul>
      ) : (
        <Surface padding="none">
          <EmptyState
            title={t("No users found.")}
            description={t("Try a different email address or display name.")}
          />
        </Surface>
      )}
    </main>
  );
}
