import { ThemeConfig } from "antd";

import colors from "./colors.module.scss";

const myTheme: ThemeConfig = {
  token: {
    colorPrimary: colors.primaryBase,
    colorLink: colors.link,
    colorLinkActive: colors.linkActive,
    colorLinkHover: colors.linkHover,
    borderRadius: 3,
    colorBorder: "#989898",
    fontFamily: "-apple-system, 'Oswald', sans-serif",
  },
  components: {
    Table: { borderColor: colors.border },
    Layout: {
      headerColor: colors.headerColor,
      headerPadding: "0 10px",
    },
    Button: {
      defaultBg: colors.contentBg,
    },
    Form: {
      itemMarginBottom: 0,
    },
    Menu: {
      itemPaddingInline: 12,
    },
    Timeline: {
      tailWidth: 5,
    },
  },
};

export { myTheme };
