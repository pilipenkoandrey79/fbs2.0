import { ThemeConfig } from "antd";

import colors from "./colors.module.scss";

const theme: ThemeConfig = {
  token: {
    colorPrimary: colors.primaryBase,
    colorLink: colors.link,
    colorLinkActive: colors.linkActive,
    colorLinkHover: colors.linkHover,
  },
  components: {
    Layout: {
      headerColor: colors.headerColor,
      headerPadding: "0 10px",
    },
    Button: {
      defaultBg: colors.contentBg,
    },
  },
};

export { theme };
