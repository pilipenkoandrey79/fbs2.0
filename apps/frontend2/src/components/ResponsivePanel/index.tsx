import { FC, ReactNode } from "react";
import { useMediaQuery } from "react-responsive";
import { Button, Drawer } from "antd";
import { CloseOutlined } from "@ant-design/icons";

import styles from "./styles.module.scss";
import variables from "../../style/variables.module.scss";

interface Props {
  children: ReactNode | ReactNode[];
  isOpen: boolean;
  maxWidth?: number;
  close: () => void;
}

const ResponsivePanel: FC<Props> = ({ children, isOpen, maxWidth, close }) => {
  const isMdScreen = useMediaQuery({
    query: `(min-width: ${variables.screenMd})`,
  });

  return isMdScreen ? (
    isOpen ? (
      <div className={styles.panel} style={maxWidth ? { maxWidth } : undefined}>
        <Button
          icon={<CloseOutlined />}
          type="text"
          className={styles["close-button"]}
          onClick={close}
        />
        {children}
      </div>
    ) : null
  ) : (
    <Drawer open={isOpen} onClose={close} maskClosable={false} title="CV">
      {children}
    </Drawer>
  );
};

export { ResponsivePanel };
