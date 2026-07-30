"use client";

import { Modal } from "antd";
import type { ReactNode } from "react";
import { Button, type ButtonVariant } from "@/app/ui/atoms/button";

export function Dialog({
  open,
  title,
  children,
  confirmLabel,
  cancelLabel,
  confirmVariant = "primary",
  confirmDisabled = false,
  loading = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  children?: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  confirmVariant?: ButtonVariant;
  confirmDisabled?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal
      centered
      closable={!loading}
      destroyOnHidden
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="quiet" disabled={loading} onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={confirmVariant}
            disabled={confirmDisabled}
            loading={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      }
      maskClosable={!loading}
      keyboard={!loading}
      open={open}
      title={title}
      onCancel={onCancel}
    >
      {children}
    </Modal>
  );
}
