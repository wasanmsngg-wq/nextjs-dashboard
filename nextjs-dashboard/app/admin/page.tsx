import {
  ArchiveBoxIcon,
  ClipboardDocumentListIcon,
  RectangleStackIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { requireAdministrator } from "@/app/features/admin/data";
import { getTranslations } from "@/app/i18n/server";
import { ButtonLink } from "@/app/ui/atoms/button";
import { Surface } from "@/app/ui/atoms/surface";
import { PageHeading } from "@/app/ui/molecules/page-heading";

const destinations = [
  {
    href: "/admin/users",
    title: "Users",
    description:
      "Review registered accounts, profile settings, and activity totals.",
    action: "Open users",
    icon: UserGroupIcon,
  },
  {
    href: "/admin/exercise-records",
    title: "Exercise records",
    description:
      "Inspect workout exercise results without changing user history.",
    action: "Open exercise records",
    icon: ClipboardDocumentListIcon,
  },
  {
    href: "/admin/master-data/categories",
    title: "Exercise categories",
    description:
      "Manage the bilingual category catalog used by exercise forms.",
    action: "Manage categories",
    icon: RectangleStackIcon,
  },
  {
    href: "/admin/master-data/exercises",
    title: "System exercises",
    description:
      "Create and maintain bilingual exercises available to everyone.",
    action: "Manage system exercises",
    icon: ArchiveBoxIcon,
  },
] as const;

export default async function AdminPage() {
  await requireAdministrator();
  const { t } = await getTranslations();
  return (
    <main className="mx-auto max-w-7xl space-y-8">
      <PageHeading
        eyebrow={t("Secure operations")}
        title={t("Administration")}
        description={t(
          "Manage accounts and shared workout data from one protected workspace.",
        )}
      />
      <div className="grid gap-5 md:grid-cols-2">
        {destinations.map(
          ({ href, title, description, action, icon: Icon }) => (
            <Surface as="section" key={href} className="flex flex-col gap-4">
              <Icon className="h-8 w-8 text-blue-700" aria-hidden="true" />
              <div className="grow space-y-2">
                <h2 className="text-xl font-bold text-slate-950">{t(title)}</h2>
                <p className="text-slate-600">{t(description)}</p>
              </div>
              <ButtonLink href={href} variant="secondary">
                {t(action)}
              </ButtonLink>
            </Surface>
          ),
        )}
      </div>
      <Surface as="section" className="space-y-2">
        <h2 className="text-lg font-bold text-slate-950">
          {t("Customer directory")}
        </h2>
        <p className="text-slate-600">
          {t(
            "The retained customer sample remains available to administrators.",
          )}
        </p>
        <ButtonLink href="/admin/customers" variant="quiet">
          {t("Open customers")}
        </ButtonLink>
      </Surface>
    </main>
  );
}
