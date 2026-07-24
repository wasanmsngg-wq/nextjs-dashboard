'use client';

import { Form, Input, InputNumber, Select, Switch } from 'antd';
import { ACCREDITATION_STATUSES, HOSPITAL_TYPES, OWNERSHIP_TYPES, type HospitalInput } from '@/app/lib/support/definitions';
import { useI18n } from '@/app/i18n/provider';
export default function HospitalForm({
  form,
}: {
  form: ReturnType<typeof Form.useForm<HospitalInput>>[0];
}) {
  const { t } = useI18n();
  return (
    <Form
      form={form}
      layout="vertical"
      variant="filled"
      requiredMark="optional"
      className="pt-3"
      aria-label={t('Hospital information')}
      validateMessages={{
        required: t('Please enter ${label}.'),
        string: {
          min: t('${label} must be at least ${min} characters.'),
        },
        types: {
          email: t('Enter a valid email address.'),
          url: t('Enter a complete URL, including https://.'),
          number: t('${label} must be a number.'),
        },
        number: {
          min: t('${label} must be at least ${min}.'),
          max: t('${label} must be no more than ${max}.'),
          range: t('${label} must be between ${min} and ${max}.'),
        },
      }}
    >
      <fieldset className="min-w-0 border-0 p-0">
        <legend className="w-full">
          <span className="flex items-center gap-3 text-sm font-semibold text-gray-900">
            <span>{t('Identity')}</span>
            <span
              className="h-px flex-1 bg-gray-200"
              aria-hidden="true"
            />
          </span>
        </legend>
        <p className="mb-5 text-sm text-gray-500">
          {t('Core information used to identify and classify the hospital.')}
        </p>
        <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
          <Form.Item
            name="hospitalName"
            label={t('Hospital name')}
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
            label={t('Hospital type')}
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              options={HOSPITAL_TYPES.map((value) => ({ value, label: t(value) }))}
            />
          </Form.Item>
          <Form.Item
            name="ownershipType"
            label={t('Ownership')}
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              options={OWNERSHIP_TYPES.map((value) => ({ value, label: t(value) }))}
            />
          </Form.Item>
          <div className="md:col-span-2">
            <Form.Item
              name="bedCapacity"
              label={t('Bed capacity')}
              extra={t('Enter the total number of staffed beds.')}
              rules={[{ required: true, type: 'number', min: 1 }]}
            >
              <InputNumber
                min={1}
                precision={0}
                className="w-full"
                style={{ width: '100%' }}
                placeholder={t('e.g. 250')}
              />
            </Form.Item>
          </div>
          <Form.Item
            name="establishedYear"
            label={t('Established year')}
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

      <fieldset className="mt-8 min-w-0 border-0 p-0">
        <legend className="w-full">
          <span className="flex items-center gap-3 text-sm font-semibold text-gray-900">
            <span>{t('Location')}</span>
            <span
              className="h-px flex-1 bg-gray-200"
              aria-hidden="true"
            />
          </span>
        </legend>
        <p className="mb-5 text-sm text-gray-500">
          {t('Postal address is required. Coordinates are optional.')}
        </p>
        <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
          <Form.Item
            name="addressLine"
            label={t('Street address')}
            rules={[{ required: true, min: 3 }]}
            className="md:col-span-2"
          >
            <Input
              placeholder={t('Building, street, district')}
              autoComplete="street-address"
            />
          </Form.Item>
          <Form.Item name="city" label={t('City')} rules={[{ required: true, min: 2 }]}>
            <Input autoComplete="address-level2" />
          </Form.Item>
          <Form.Item
            name="stateProvince"
            label={t('State / province')}
            rules={[{ required: true, min: 2 }]}
          >
            <Input autoComplete="address-level1" />
          </Form.Item>
          <Form.Item
            name="postalCode"
            label={t('Postal code')}
            rules={[{ required: true, min: 2 }]}
          >
            <Input autoComplete="postal-code" />
          </Form.Item>
          <Form.Item
            name="country"
            label={t('Country')}
            rules={[{ required: true, min: 2 }]}
          >
            <Input autoComplete="country-name" />
          </Form.Item>
          <Form.Item
            name="latitude"
            label={t('Latitude')}
            rules={[{ type: 'number', min: -90, max: 90 }]}
          >
            <InputNumber min={-90} max={90} className="w-full" />
          </Form.Item>
          <Form.Item
            name="longitude"
            label={t('Longitude')}
            rules={[{ type: 'number', min: -180, max: 180 }]}
          >
            <InputNumber min={-180} max={180} className="w-full" />
          </Form.Item>
        </div>
      </fieldset>

      <fieldset className="mt-8 min-w-0 border-0 p-0">
        <legend className="w-full">
          <span className="flex items-center gap-3 text-sm font-semibold text-gray-900">
            <span>{t('Contact and operations')}</span>
            <span
              className="h-px flex-1 bg-gray-200"
              aria-hidden="true"
            />
          </span>
        </legend>
        <p className="mb-5 text-sm text-gray-500">
          {t('Public contact details, accreditation, and available services.')}
        </p>
        <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
          <Form.Item name="phoneNumber" label={t('Phone number')}>
            <Input autoComplete="tel" placeholder="+66 ..." />
          </Form.Item>
          <Form.Item name="email" label={t('Email')} rules={[{ type: 'email' }]}>
            <Input autoComplete="email" />
          </Form.Item>
          <Form.Item
            name="website"
            label={t('Website')}
            rules={[{ type: 'url' }]}
          >
            <Input placeholder="https://example.com" inputMode="url" />
          </Form.Item>
          <Form.Item
            name="rating"
            label={t('Rating')}
            rules={[{ type: 'number', min: 0, max: 5 }]}
          >
            <InputNumber
              min={0}
              max={5}
              step={0.1}
              className="w-full"
              suffix="/ 5"
            />
          </Form.Item>
          <Form.Item
            name="accreditationStatus"
            label={t('Accreditation')}
            rules={[{ required: true }]}
          >
            <Select
              options={ACCREDITATION_STATUSES.map((value) => ({ value, label: t(value) }))}
            />
          </Form.Item>
          <div className="hidden md:block" />
          <Form.Item
            name="emergencyService"
            label={t('Emergency service')}
            valuePropName="checked"
          >
            <Switch checkedChildren={t('Available')} unCheckedChildren={t('Unavailable')} />
          </Form.Item>
          <Form.Item
            name="ambulanceService"
            label={t('Ambulance service')}
            valuePropName="checked"
          >
            <Switch checkedChildren={t('Available')} unCheckedChildren={t('Unavailable')} />
          </Form.Item>
        </div>
      </fieldset>
    </Form>
  );
}
