import { ThemeConfig } from "antd";

import colors from "./colors.module.scss";

const theme: ThemeConfig = {
  token: {
    colorPrimary: colors.primaryBase,
    colorLink: colors.link,
    colorLinkActive: colors.linkActive,
    colorLinkHover: colors.linkHover,
    borderRadius: 3,
    colorBorder: "#989898",
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
  },
};

export { theme };
