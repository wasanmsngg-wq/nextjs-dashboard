'use client';

import { useState, useTransition, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  BuildingOffice2Icon,
  CalendarDaysIcon,
  EllipsisHorizontalIcon,
  EnvelopeIcon,
  EyeIcon,
  GlobeAltIcon,
  MapPinIcon,
  PencilSquareIcon,
  PhoneIcon,
  PlusIcon,
  StarIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import {
  Button,
  Drawer,
  Dropdown,
  Empty,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Switch,
  Table,
  Tag,
  Typography,
  type MenuProps,
  type TableColumnsType,
} from 'antd';
import {
  createHospital,
  deleteHospital,
  updateHospital,
} from '@/app/lib/support/actions';
import {
  ACCREDITATION_STATUSES,
  HOSPITAL_TYPES,
  OWNERSHIP_TYPES,
  type AccreditationStatus,
  type Hospital,
  type HospitalInput,
} from '@/app/lib/support/definitions';

const { Text, Link } = Typography;
const missingValue = 'Not provided';

const statusColors = {
  Accredited: 'green',
  Pending: 'gold',
  'Not Accredited': 'default',
} as const;

const emptyHospital: Partial<HospitalInput> = {
  country: 'Thailand',
  emergencyService: true,
  ambulanceService: true,
  accreditationStatus: 'Pending',
};

function optional(value: unknown) {
  return value === '' || value === undefined ? null : value;
}

function normalise(values: HospitalInput): HospitalInput {
  return {
    ...values,
    phoneNumber: optional(values.phoneNumber) as string | null,
    email: optional(values.email) as string | null,
    website: optional(values.website) as string | null,
    establishedYear: optional(values.establishedYear) as number | null,
    rating: optional(values.rating) as number | null,
    latitude: optional(values.latitude) as number | null,
    longitude: optional(values.longitude) as number | null,
  };
}

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

function ProfileRow({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-3 py-3">
      <div className="mt-0.5 text-gray-400" aria-hidden="true">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {label}
        </div>
        <div className="mt-1 break-words text-sm text-gray-900">{children}</div>
      </div>
    </div>
  );
}

function HospitalProfile({ hospital }: { hospital: Hospital }) {
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
              <Tag>{hospital.hospitalType}</Tag>
              <Tag>{hospital.ownershipType}</Tag>
              <Tag color={statusColors[hospital.accreditationStatus]}>
                {hospital.accreditationStatus}
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
            Hospital overview
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <ProfileStat
              icon={<BuildingOffice2Icon className="h-4 w-4" />}
              label="Capacity"
              value={`${Number(hospital.bedCapacity).toLocaleString()} beds`}
            />
            <ProfileStat
              icon={<CalendarDaysIcon className="h-4 w-4" />}
              label="Established"
              value={hospital.establishedYear || missingValue}
            />
            <ProfileStat
              icon={<StarIcon className="h-4 w-4" />}
              label="Rating"
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
            Contact
          </h3>
          <div className="mt-2 divide-y divide-gray-100 rounded-xl border border-gray-200 px-4">
            <ProfileRow
              icon={<PhoneIcon className="h-5 w-5" />}
              label="Phone"
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
              label="Email"
            >
              {hospital.email ? (
                <Link href={`mailto:${hospital.email}`}>{hospital.email}</Link>
              ) : (
                <span className="text-gray-500">{missingValue}</span>
              )}
            </ProfileRow>
            <ProfileRow
              icon={<GlobeAltIcon className="h-5 w-5" />}
              label="Website"
            >
              {hospital.website ? (
                <Link
                  href={hospital.website}
                  target="_blank"
                  rel="noreferrer"
                >
                  Visit hospital website
                  <span className="sr-only"> (opens in a new tab)</span>
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
            Location
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
                Coordinates: {hospital.latitude}, {hospital.longitude}
              </div>
            ) : null}
          </div>
        </section>

        <section aria-labelledby="hospital-services-heading">
          <h3
            id="hospital-services-heading"
            className="text-sm font-semibold text-gray-950"
          >
            Services
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
                  {String(label)}
                </span>
                <Tag color={available ? 'blue' : 'default'}>
                  {available ? 'Available' : 'Unavailable'}
                </Tag>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function HospitalForm({
  form,
}: {
  form: ReturnType<typeof Form.useForm<HospitalInput>>[0];
}) {
  return (
    <Form
      form={form}
      layout="vertical"
      requiredMark="optional"
      className="pt-3"
      aria-label="Hospital information"
      validateMessages={{
        required: 'Please enter ${label}.',
        string: {
          min: '${label} must be at least ${min} characters.',
        },
        types: {
          email: 'Enter a valid email address.',
          url: 'Enter a complete URL, including https://.',
          number: '${label} must be a number.',
        },
        number: {
          min: '${label} must be at least ${min}.',
          max: '${label} must be no more than ${max}.',
          range: '${label} must be between ${min} and ${max}.',
        },
      }}
    >
      <fieldset className="rounded-xl border border-gray-200 p-4 sm:p-5">
        <legend className="px-2 text-sm font-semibold text-gray-900">
          Identity
        </legend>
        <p className="mb-5 text-sm text-gray-500">
          Core information used to identify and classify the hospital.
        </p>
        <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
          <Form.Item
            name="hospitalName"
            label="Hospital name"
            rules={[{ required: true, min: 2 }]}
            className="md:col-span-2"
          >
            <Input
              placeholder="e.g. Bangkok General Hospital"
              autoComplete="organization"
            />
          </Form.Item>
          <Form.Item
            name="hospitalType"
            label="Hospital type"
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              options={HOSPITAL_TYPES.map((value) => ({ value }))}
            />
          </Form.Item>
          <Form.Item
            name="ownershipType"
            label="Ownership"
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              options={OWNERSHIP_TYPES.map((value) => ({ value }))}
            />
          </Form.Item>
          <Form.Item
            name="bedCapacity"
            label="Bed capacity"
            rules={[{ required: true, type: 'number', min: 1 }]}
          >
            <InputNumber
              min={1}
              precision={0}
              className="w-full"
              addonAfter="beds"
            />
          </Form.Item>
          <Form.Item
            name="establishedYear"
            label="Established year"
            rules={[
              {
                type: 'number',
                min: 1800,
                max: new Date().getFullYear(),
              },
            ]}
          >
            <InputNumber
              min={1800}
              max={new Date().getFullYear()}
              precision={0}
              className="w-full"
              placeholder="YYYY"
            />
          </Form.Item>
        </div>
      </fieldset>

      <fieldset className="mt-5 rounded-xl border border-gray-200 p-4 sm:p-5">
        <legend className="px-2 text-sm font-semibold text-gray-900">
          Location
        </legend>
        <p className="mb-5 text-sm text-gray-500">
          Postal address is required. Coordinates are optional.
        </p>
        <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
          <Form.Item
            name="addressLine"
            label="Street address"
            rules={[{ required: true, min: 3 }]}
            className="md:col-span-2"
          >
            <Input
              placeholder="Building, street, district"
              autoComplete="street-address"
            />
          </Form.Item>
          <Form.Item name="city" label="City" rules={[{ required: true, min: 2 }]}>
            <Input autoComplete="address-level2" />
          </Form.Item>
          <Form.Item
            name="stateProvince"
            label="State / province"
            rules={[{ required: true, min: 2 }]}
          >
            <Input autoComplete="address-level1" />
          </Form.Item>
          <Form.Item
            name="postalCode"
            label="Postal code"
            rules={[{ required: true, min: 2 }]}
          >
            <Input autoComplete="postal-code" />
          </Form.Item>
          <Form.Item
            name="country"
            label="Country"
            rules={[{ required: true, min: 2 }]}
          >
            <Input autoComplete="country-name" />
          </Form.Item>
          <Form.Item
            name="latitude"
            label="Latitude"
            rules={[{ type: 'number', min: -90, max: 90 }]}
          >
            <InputNumber min={-90} max={90} className="w-full" />
          </Form.Item>
          <Form.Item
            name="longitude"
            label="Longitude"
            rules={[{ type: 'number', min: -180, max: 180 }]}
          >
            <InputNumber min={-180} max={180} className="w-full" />
          </Form.Item>
        </div>
      </fieldset>

      <fieldset className="mt-5 rounded-xl border border-gray-200 p-4 sm:p-5">
        <legend className="px-2 text-sm font-semibold text-gray-900">
          Contact and operations
        </legend>
        <p className="mb-5 text-sm text-gray-500">
          Public contact details, accreditation, and available services.
        </p>
        <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
          <Form.Item name="phoneNumber" label="Phone number">
            <Input autoComplete="tel" placeholder="+66 ..." />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ type: 'email' }]}>
            <Input autoComplete="email" />
          </Form.Item>
          <Form.Item
            name="website"
            label="Website"
            rules={[{ type: 'url' }]}
          >
            <Input placeholder="https://example.com" inputMode="url" />
          </Form.Item>
          <Form.Item
            name="rating"
            label="Rating"
            rules={[{ type: 'number', min: 0, max: 5 }]}
          >
            <InputNumber
              min={0}
              max={5}
              step={0.1}
              className="w-full"
              addonAfter="/ 5"
            />
          </Form.Item>
          <Form.Item
            name="accreditationStatus"
            label="Accreditation"
            rules={[{ required: true }]}
          >
            <Select
              options={ACCREDITATION_STATUSES.map((value) => ({ value }))}
            />
          </Form.Item>
          <div className="hidden md:block" />
          <Form.Item
            name="emergencyService"
            label="Emergency service"
            valuePropName="checked"
          >
            <Switch checkedChildren="Available" unCheckedChildren="Unavailable" />
          </Form.Item>
          <Form.Item
            name="ambulanceService"
            label="Ambulance service"
            valuePropName="checked"
          >
            <Switch checkedChildren="Available" unCheckedChildren="Unavailable" />
          </Form.Item>
        </div>
      </fieldset>
    </Form>
  );
}

export default function HospitalManager({
  hospitals,
}: {
  hospitals: Hospital[];
}) {
  const router = useRouter();
  const [form] = Form.useForm<HospitalInput>();
  const [editorOpen, setEditorOpen] = useState(false);
  const [selected, setSelected] = useState<Hospital | null>(null);
  const [viewing, setViewing] = useState<Hospital | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Hospital | null>(null);
  const [isPending, startTransition] = useTransition();
  const [messageApi, contextHolder] = message.useMessage();

  const openCreate = () => {
    setSelected(null);
    form.setFieldsValue(emptyHospital);
    setEditorOpen(true);
  };

  const openEdit = (hospital: Hospital) => {
    setSelected(hospital);
    setViewing(null);
    form.setFieldsValue(hospital);
    setEditorOpen(true);
  };

  const save = async () => {
    let values: HospitalInput;
    try {
      values = normalise(await form.validateFields());
    } catch (error) {
      const validationError = error as {
        errorFields?: Array<{ name: Array<string | number> }>;
      };
      const firstField = validationError.errorFields?.[0]?.name;
      if (firstField) {
        form.scrollToField(firstField, { block: 'center', behavior: 'smooth' });
      }
      return;
    }

    startTransition(async () => {
      const result = selected
        ? await updateHospital(selected.hospitalId, values)
        : await createHospital(values);
      if (result.success) {
        messageApi.success(result.message);
        setEditorOpen(false);
        form.resetFields();
        router.refresh();
      } else {
        messageApi.error(result.message);
      }
    });
  };

  const remove = (hospital: Hospital) => {
    startTransition(async () => {
      const result = await deleteHospital(hospital.hospitalId);
      if (result.success) {
        messageApi.success(result.message);
        router.refresh();
      } else {
        messageApi.error(result.message);
      }
    });
  };

  const actions = (hospital: Hospital): MenuProps['items'] => [
    {
      key: 'view',
      icon: <EyeIcon className="h-4 w-4" />,
      label: 'View details',
      onClick: () => setViewing(hospital),
    },
    {
      key: 'edit',
      icon: <PencilSquareIcon className="h-4 w-4" />,
      label: 'Edit hospital',
      onClick: () => openEdit(hospital),
    },
    { type: 'divider' },
    {
      key: 'delete',
      danger: true,
      icon: <TrashIcon className="h-4 w-4" />,
      label: 'Delete',
      onClick: () => setDeleteTarget(hospital),
    },
  ];

  const columns: TableColumnsType<Hospital> = [
    {
      title: 'Hospital',
      dataIndex: 'hospitalName',
      key: 'hospitalName',
      render: (name, hospital) => (
        <button
          type="button"
          className="text-left"
          onClick={() => setViewing(hospital)}
        >
          <Text strong>{name}</Text>
          <div className="mt-0.5 text-xs text-gray-500">
            {hospital.city}, {hospital.country}
          </div>
        </button>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'hospitalType',
      key: 'hospitalType',
      render: (value) => <Tag>{value}</Tag>,
    },
    {
      title: 'Ownership',
      dataIndex: 'ownershipType',
      key: 'ownershipType',
    },
    {
      title: 'Capacity',
      dataIndex: 'bedCapacity',
      key: 'bedCapacity',
      align: 'right',
      render: (value) => `${Number(value).toLocaleString()} beds`,
    },
    {
      title: 'Status',
      dataIndex: 'accreditationStatus',
      key: 'accreditationStatus',
      render: (value: AccreditationStatus) => (
        <Tag color={statusColors[value]}>{value}</Tag>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 56,
      align: 'center',
      render: (_, hospital) => (
        <Dropdown
          menu={{ items: actions(hospital) }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button
            type="text"
            icon={<EllipsisHorizontalIcon className="h-5 w-5" />}
            aria-label={`Actions for ${hospital.hospitalName}`}
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
        <div>
          <Text strong>Hospitals</Text>
          <div className="text-xs text-gray-500">
            {hospitals.length} shown on this page
          </div>
        </div>
        <Button
          type="primary"
          icon={<PlusIcon className="h-4 w-4" />}
          onClick={openCreate}
        >
          Add hospital
        </Button>
      </div>

      <Table<Hospital>
        rowKey="hospitalId"
        dataSource={hospitals}
        columns={columns}
        pagination={false}
        loading={isPending}
        scroll={{ x: 720 }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No hospitals found"
            >
              <Button type="primary" onClick={openCreate}>
                Add the first hospital
              </Button>
            </Empty>
          ),
        }}
      />

      <Modal
        title={
          <div>
            <div className="text-base font-semibold text-gray-900">
              {selected ? 'Edit hospital' : 'Add hospital'}
            </div>
            <div className="mt-1 text-sm font-normal text-gray-500">
              {selected
                ? `Update the profile for ${selected.hospitalName}.`
                : 'Create a complete hospital profile for the directory.'}
            </div>
          </div>
        }
        open={editorOpen}
        width={820}
        okText={selected ? 'Save changes' : 'Create hospital'}
        confirmLoading={isPending}
        onOk={save}
        onCancel={() => {
          setEditorOpen(false);
          form.resetFields();
        }}
        destroyOnHidden
      >
        <HospitalForm form={form} />
      </Modal>

      <Drawer
        title="Hospital profile"
        open={Boolean(viewing)}
        size={560}
        onClose={() => setViewing(null)}
        styles={{ body: { padding: 0 } }}
        extra={
          viewing ? (
            <Button
              icon={<PencilSquareIcon className="h-4 w-4" />}
              onClick={() => openEdit(viewing)}
            >
              Edit
            </Button>
          ) : null
        }
      >
        {viewing ? <HospitalProfile hospital={viewing} /> : null}
      </Drawer>

      <Modal
        title="Delete hospital?"
        open={Boolean(deleteTarget)}
        okText="Delete"
        okButtonProps={{ danger: true }}
        confirmLoading={isPending}
        onCancel={() => setDeleteTarget(null)}
        onOk={() => {
          if (deleteTarget) {
            remove(deleteTarget);
            setDeleteTarget(null);
          }
        }}
      >
        <p className="text-gray-600">
          {deleteTarget?.hospitalName} will be permanently removed. This action
          cannot be undone.
        </p>
      </Modal>
    </>
  );
}
