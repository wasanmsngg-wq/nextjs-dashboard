'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { PencilSquareIcon, PlusIcon } from '@heroicons/react/24/outline';
import {
  Button,
  Drawer,
  Form,
  message,
  Modal,
  Typography,
} from 'antd';
import {
  createHospital,
  deleteHospital,
  updateHospital,
} from '@/app/lib/support/actions';
import {
  type Hospital,
  type HospitalInput,
} from '@/app/lib/support/definitions';
import { useI18n } from '@/app/i18n/provider';
import { HospitalTable } from './hospital-list';
import { HospitalDeleteDialog } from './hospital-delete-dialog';
import HospitalForm from './hospital-form';
import HospitalProfile from './hospital-profile';
import { FocusTrap } from '@/app/ui/molecules/focus-trap';

const { Text } = Typography;

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

export default function HospitalManager({
  hospitals,
  pageSize,
}: {
  hospitals: Hospital[];
  pageSize: number;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [form] = Form.useForm<HospitalInput>();
  const [editorOpen, setEditorOpen] = useState(false);
  const [selected, setSelected] = useState<Hospital | null>(null);
  const [viewing, setViewing] = useState<Hospital | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Hospital | null>(null);
  const [isPending, startTransition] = useTransition();
  const [messageApi, contextHolder] = message.useMessage();
  const returnFocus = useRef<HTMLElement | null>(null);

  const openCreate = () => {
    returnFocus.current = document.activeElement as HTMLElement;
    setSelected(null);
    form.setFieldsValue(emptyHospital);
    setEditorOpen(true);
  };

  const openEdit = (hospital: Hospital) => {
    returnFocus.current = document.activeElement as HTMLElement;
    setSelected(hospital);
    setViewing(null);
    form.setFieldsValue(hospital);
    setEditorOpen(true);
  };

  const closeEditor = () => {
    const target = returnFocus.current;
    setEditorOpen(false);
    form.resetFields();
    window.setTimeout(() => target?.focus(), 350);
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
        messageApi.success(t(result.message));
        closeEditor();
        router.refresh();
      } else {
        messageApi.error(t(result.message));
      }
    });
  };

  const remove = (hospital: Hospital) => {
    startTransition(async () => {
      const result = await deleteHospital(hospital.hospitalId);
      if (result.success) {
        messageApi.success(t(result.message));
        router.refresh();
      } else {
        messageApi.error(t(result.message));
      }
    });
  };

  return (
    <>
      {contextHolder}
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
        <div>
          <Text strong>{t('Hospitals')}</Text>
          <div className="text-xs text-gray-500">
            {t('{count} shown on this page', { count: hospitals.length })}
          </div>
        </div>
        <Button
          type="primary"
          icon={<PlusIcon className="h-4 w-4" />}
          onClick={openCreate}
        >
          {t('Add hospital')}
        </Button>
      </div>

      <HospitalTable hospitals={hospitals} pageSize={pageSize} pending={isPending} onCreate={openCreate} onView={setViewing} onEdit={openEdit} onDelete={setDeleteTarget} />

      <Modal
        title={
          <div>
            <div className="text-base font-semibold text-gray-900">
              {t(selected ? 'Edit hospital' : 'Add hospital')}
            </div>
            <div className="mt-1 text-sm font-normal text-gray-500">
              {selected
                ? t('Update the profile for {name}.', { name: selected.hospitalName })
                : t('Create a complete hospital profile for the directory.')}
            </div>
          </div>
        }
        open={editorOpen}
        width={820}
        okText={t(selected ? 'Save changes' : 'Create hospital')}
        cancelText={t('Cancel')}
        confirmLoading={isPending}
        onOk={save}
        onCancel={closeEditor}
        destroyOnHidden
        focusTriggerAfterClose={false}
        modalRender={(node) => <FocusTrap open={editorOpen}>{node}</FocusTrap>}
        afterOpenChange={(open) => {
          if (!open) window.setTimeout(() => returnFocus.current?.focus(), 0);
        }}
      >
        <HospitalForm form={form} />
      </Modal>

      <Drawer
        title={t('Hospital profile')}
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
              {t('Edit')}
            </Button>
          ) : null
        }
      >
        {viewing ? <HospitalProfile hospital={viewing} /> : null}
      </Drawer>

      <HospitalDeleteDialog
        hospital={deleteTarget}
        pending={isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            remove(deleteTarget);
            setDeleteTarget(null);
          }
        }}
      />
    </>
  );
}
