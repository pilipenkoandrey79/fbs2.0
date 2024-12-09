import { FC, useState } from "react";
import { Flex, Modal } from "antd";
import { useTranslation } from "react-i18next";
import { Country } from "@fbs2.0/types";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";

import { Language } from "../../../../../../i18n/locales";
import { Flag } from "../../../../../../components/Flag";
import { InitialView } from "./components/InitialView";
import { CombatMatches } from "./components/CombatMatches";

import styles from "./styles.module.scss";

interface Props {
  country: Country;
  open: boolean;
  onClose: () => void;
}

const CombatStats: FC<Props> = ({ onClose, open, country }) => {
  const { i18n } = useTranslation();

  const [rival, setRival] = useState<Country>();

  return (
    <Modal
      open={open}
      className={styles.modal}
      title={
        <Flex gap="small">
          <Flag country={country} className={styles.flag} />
          <span>
            {(i18n.resolvedLanguage === Language.en
              ? country.name
              : country.name_ua) || country.name}
          </span>

          {rival && (
            <span>
              <ArrowLeftOutlined />
              <ArrowRightOutlined />
            </span>
          )}
          <Flag country={rival} className={styles.flag} />
          <span>
            {(i18n.resolvedLanguage === Language.en
              ? rival?.name
              : rival?.name_ua) || rival?.name}
          </span>
        </Flex>
      }
      onClose={onClose}
      onCancel={onClose}
      width={800}
      maskClosable={false}
      footer={[]}
    >
      <div className={styles.content}>
        {rival ? (
          <CombatMatches rival={rival} setRival={setRival} country={country} />
        ) : (
          <InitialView rival={rival} setRival={setRival} />
        )}
      </div>
    </Modal>
  );
};

export { CombatStats };
