'use client';

import { Modal } from 'antd';
import { FocusTrap } from '@/app/ui/molecules/focus-trap';

export function ConfirmDialog(props: { open: boolean; title: string; description: string; confirmLabel: string; cancelLabel: string; pending?: boolean; onConfirm: () => void; onCancel: () => void }) {
  return <Modal title={props.title} open={props.open} okText={props.confirmLabel} cancelText={props.cancelLabel} okButtonProps={{ danger: true }} confirmLoading={props.pending} onOk={props.onConfirm} onCancel={props.onCancel} modalRender={(node) => <FocusTrap open={props.open}>{node}</FocusTrap>}><p className="text-gray-600">{props.description}</p></Modal>;
}
