import { FC, ReactNode } from "react";
import { Button, Typography } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import { Country } from "@fbs2.0/types";
import { useTranslation } from "react-i18next";

import { Paths } from "../../../../../../routes";
import { Language } from "../../../../../../i18n/locales";
import { Flag } from "../../../../../../components/Flag";

import styles from "./styles.module.scss";

interface Props {
  country: Country | undefined;
  children: ReactNode[];
}

const SubHeader: FC<Props> = ({ country, children }) => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className={styles.root}>
      <div className={styles.title}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(Paths.CLUBS)}
        />
        <Typography.Title level={3}>
          <Flag country={country} className={styles.flag} />
          {(i18n.resolvedLanguage === Language.en
            ? country?.name
            : country?.name_ua) || country?.name}
        </Typography.Title>
      </div>

      <div className={styles.panel}>{children}</div>
    </div>
  );
};

export { SubHeader };
