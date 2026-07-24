'use client';

import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react';

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function FocusTrap({ open, children }: { open: boolean; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const restoreTarget = useRef<HTMLElement | null>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (open && !wasOpen.current) restoreTarget.current = document.activeElement as HTMLElement;
    if (!open && wasOpen.current) restoreTarget.current?.focus();
    wasOpen.current = open;
  }, [open]);

  const trap = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab' || !root.current) return;
    const controls = Array.from(root.current.querySelectorAll<HTMLElement>(focusableSelector))
      .filter((element) => element.offsetParent !== null && !element.classList.contains('ant-modal-sentinel'));
    if (!controls.length) return;
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return <div ref={root} onKeyDown={trap}>{children}</div>;
}
