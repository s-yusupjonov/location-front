import type { ThemeConfig } from "antd";

export const agrobankTheme: ThemeConfig = {
  token: {
    colorPrimary: "#309C44",
    colorLink: "#309C44",
    colorLinkHover: "#278636",
    borderRadius: 10,
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    colorBgLayout: "#F5F7F6",
    colorBgContainer: "#FFFFFF",
    colorText: "#1A1F1C",
    colorTextSecondary: "#6B7280",
    colorBorder: "#E5E9E7",
    colorWarning: "#D97706",
  },
  components: {
    Button: {
      controlHeight: 42,
      fontWeight: 500,
      primaryShadow: "none",
    },
    Input: {
      controlHeight: 42,
    },
    Select: {
      controlHeight: 42,
    },
  },
};
