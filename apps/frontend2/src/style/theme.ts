import { ThemeConfig } from "antd";

import colors from "./colors.module.scss";

const theme: ThemeConfig = {
  token: {
    colorPrimary: colors.primaryBase,
    colorLink: colors.link,
    colorLinkActive: colors.linkActive,
    colorLinkHover: colors.linkHover,
    borderRadius: 3,
  },
  components: {
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
  },
};

export { theme };
