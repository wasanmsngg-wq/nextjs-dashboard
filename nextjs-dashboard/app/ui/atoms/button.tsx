"use client";

import { Button as AntButton, type ButtonProps as AntButtonProps } from "antd";
import type { ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "quiet" | "danger";

export type ButtonProps = Omit<
  AntButtonProps,
  "color" | "danger" | "type" | "variant"
> & {
  variant?: ButtonVariant;
};

const variantProperties: Record<ButtonVariant, AntButtonProps> = {
  primary: { type: "primary" },
  secondary: { type: "default" },
  quiet: { type: "text" },
  danger: { type: "default", danger: true },
};

export function Button({
  variant = "primary",
  children,
  ...props
}: ButtonProps) {
  return (
    <AntButton {...variantProperties[variant]} {...props}>
      {children}
    </AntButton>
  );
}

export function ButtonLink({
  href,
  children,
  ...props
}: ButtonProps & { href: string; children: ReactNode }) {
  return (
    <Button href={href} {...props}>
      {children}
    </Button>
  );
}
