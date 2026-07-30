"use client";

import { notification } from "antd";
import { useEffect } from "react";

export type ToastNotice = {
  id: number;
  message: string;
  type: "success" | "error" | "info" | "warning";
};

export function Toast({ notice }: { notice: ToastNotice | null }) {
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    if (!notice) return;
    api[notice.type]({
      key: "exercise-tracker-feedback",
      message: notice.message,
      placement: "topRight",
      duration: notice.type === "error" ? 5 : 3,
      role: notice.type === "error" ? "alert" : "status",
    });
  }, [api, notice]);

  return contextHolder;
}
