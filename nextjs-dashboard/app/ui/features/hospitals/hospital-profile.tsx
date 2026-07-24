'use client';

import type { ReactNode } from 'react';
import { BuildingOffice2Icon, CalendarDaysIcon, EnvelopeIcon, GlobeAltIcon, MapPinIcon, PhoneIcon, StarIcon } from '@heroicons/react/24/outline';
import { Tag, Typography } from 'antd';
import type { Hospital } from '@/app/lib/support/definitions';
import { useI18n } from '@/app/i18n/provider';
import { ProfileRow } from '@/app/ui/molecules/profile-row';

const { Link } = Typography;
const statusColors = { Accredited: 'green', Pending: 'gold', 'Not Accredited': 'default' } as const;
function ProfileStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        {icon}
      </div>
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-1 font-semibold text-gray-900">{value}</div>
    </div>
  );
}

export default function HospitalProfile({ hospital }: { hospital: Hospital }) {
  const { t } = useI18n();
  const missingValue = t('Not provided');
  return (
    <div>
      <section
        className="border-b border-gray-200 bg-gradient-to-br from-blue-50 to-white px-6 py-6"
        aria-labelledby="hospital-profile-name"
      >
        <div className="flex items-start gap-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm"
            aria-hidden="true"
          >
            <BuildingOffice2Icon className="h-7 w-7" />
          </div>
          <div className="min-w-0">
            <h2
              id="hospital-profile-name"
              className="text-xl font-semibold leading-7 text-gray-950"
            >
              {hospital.hospitalName}
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <Tag>{t(hospital.hospitalType)}</Tag>
              <Tag>{t(hospital.ownershipType)}</Tag>
              <Tag color={statusColors[hospital.accreditationStatus]}>
                {t(hospital.accreditationStatus)}
              </Tag>
            </div>
            <div className="mt-3 flex items-start gap-2 text-sm text-gray-600">
              <MapPinIcon
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              <span>
                {hospital.city}, {hospital.stateProvince}, {hospital.country}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-7 px-6 py-6">
        <section aria-labelledby="hospital-overview-heading">
          <h3 id="hospital-overview-heading" className="sr-only">
            {t('Hospital overview')}
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <ProfileStat
              icon={<BuildingOffice2Icon className="h-4 w-4" />}
              label={t('Capacity')}
              value={`${Number(hospital.bedCapacity).toLocaleString()} ${t('beds')}`}
            />
            <ProfileStat
              icon={<CalendarDaysIcon className="h-4 w-4" />}
              label={t('Established')}
              value={hospital.establishedYear || missingValue}
            />
            <ProfileStat
              icon={<StarIcon className="h-4 w-4" />}
              label={t('Rating')}
              value={
                hospital.rating == null
                  ? missingValue
                  : `${hospital.rating} / 5`
              }
            />
          </div>
        </section>

        <section aria-labelledby="hospital-contact-heading">
          <h3
            id="hospital-contact-heading"
            className="text-sm font-semibold text-gray-950"
          >
            {t('Contact')}
          </h3>
          <div className="mt-2 divide-y divide-gray-100 rounded-xl border border-gray-200 px-4">
            <ProfileRow
              icon={<PhoneIcon className="h-5 w-5" />}
              label={t('Phone')}
            >
              {hospital.phoneNumber ? (
                <Link href={`tel:${hospital.phoneNumber}`}>
                  {hospital.phoneNumber}
                </Link>
              ) : (
                <span className="text-gray-500">{missingValue}</span>
              )}
            </ProfileRow>
            <ProfileRow
              icon={<EnvelopeIcon className="h-5 w-5" />}
              label={t('Email')}
            >
              {hospital.email ? (
                <Link href={`mailto:${hospital.email}`}>{hospital.email}</Link>
              ) : (
                <span className="text-gray-500">{missingValue}</span>
              )}
            </ProfileRow>
            <ProfileRow
              icon={<GlobeAltIcon className="h-5 w-5" />}
              label={t('Website')}
            >
              {hospital.website ? (
                <Link
                  href={hospital.website}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t('Visit hospital website')}
                  <span className="sr-only"> {t('(opens in a new tab)')}</span>
                </Link>
              ) : (
                <span className="text-gray-500">{missingValue}</span>
              )}
            </ProfileRow>
          </div>
        </section>

        <section aria-labelledby="hospital-location-heading">
          <h3
            id="hospital-location-heading"
            className="text-sm font-semibold text-gray-950"
          >
            {t('Location')}
          </h3>
          <div className="mt-2 rounded-xl border border-gray-200 p-4">
            <div className="flex gap-3">
              <MapPinIcon
                className="mt-0.5 h-5 w-5 shrink-0 text-gray-400"
                aria-hidden="true"
              />
              <address className="text-sm not-italic leading-6 text-gray-700">
                {hospital.addressLine}
                <br />
                {hospital.city}, {hospital.stateProvince} {hospital.postalCode}
                <br />
                {hospital.country}
              </address>
            </div>
            {hospital.latitude != null && hospital.longitude != null ? (
              <div className="mt-3 border-t border-gray-100 pt-3 text-xs text-gray-500">
                {t('Coordinates')}: {hospital.latitude}, {hospital.longitude}
              </div>
            ) : null}
          </div>
        </section>

        <section aria-labelledby="hospital-services-heading">
          <h3
            id="hospital-services-heading"
            className="text-sm font-semibold text-gray-950"
          >
            {t('Services')}
          </h3>
          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              ['Emergency service', hospital.emergencyService],
              ['Ambulance service', hospital.ambulanceService],
            ].map(([label, available]) => (
              <div
                key={String(label)}
                className="flex items-center justify-between rounded-xl border border-gray-200 p-4"
              >
                <span className="text-sm font-medium text-gray-700">
                  {t(String(label))}
                </span>
                <Tag color={available ? 'blue' : 'default'}>
                  {t(available ? 'Available' : 'Unavailable')}
                </Tag>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
