import type { ThemeConfig } from "antd";

export const designTokens = {
  color: {
    brand: "#1e40af",
    brandHover: "#1e3a8a",
    brandActive: "#172554",
    success: "#15803d",
    warning: "#b45309",
    danger: "#b91c1c",
    text: "#0f172a",
    textSecondary: "#475569",
    border: "#e2e8f0",
    surface: "#ffffff",
    canvas: "#f8fafc",
  },
  radius: {
    control: 10,
    surface: 16,
    hero: 24,
  },
  size: {
    control: 44,
  },
} as const;

export const appTheme: ThemeConfig = {
  token: {
    colorPrimary: designTokens.color.brand,
    colorSuccess: designTokens.color.success,
    colorWarning: designTokens.color.warning,
    colorError: designTokens.color.danger,
    colorText: designTokens.color.text,
    colorTextSecondary: designTokens.color.textSecondary,
    colorBorder: designTokens.color.border,
    colorBgBase: designTokens.color.surface,
    colorBgLayout: designTokens.color.canvas,
    borderRadius: designTokens.radius.control,
    controlHeight: designTokens.size.control,
    fontSize: 16,
  },
  components: {
    Button: {
      borderRadius: designTokens.radius.control,
      colorPrimary: designTokens.color.brand,
      colorPrimaryActive: designTokens.color.brandActive,
      colorPrimaryHover: designTokens.color.brandHover,
      controlHeight: designTokens.size.control,
      fontWeight: 600,
      primaryShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
    },
    Card: {
      borderRadiusLG: designTokens.radius.surface,
      boxShadowTertiary: "0 1px 3px rgba(15, 23, 42, 0.08)",
    },
    Input: {
      activeBorderColor: designTokens.color.brand,
      hoverBorderColor: designTokens.color.brand,
    },
    Select: {
      activeBorderColor: designTokens.color.brand,
      hoverBorderColor: designTokens.color.brand,
    },
  },
};
