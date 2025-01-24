import { Typography } from "antd";
import { FC, useContext } from "react";
import { useTranslation } from "react-i18next";

import { ParticipantSelector } from "../ParticipantSelector";
import { HighlightContext } from "../../../../context/highlightContext";

import styles from "./styles.module.scss";

const Highlight: FC = () => {
  const { t } = useTranslation();
  const { highlightId, setHighlightId } = useContext(HighlightContext);

  return (
    <div className={styles.highlight}>
      <Typography.Text>{t("tournament.highlight")}</Typography.Text>
      <ParticipantSelector
        formItem={false}
        allowClear
        value={highlightId}
        onChange={(value) => setHighlightId(value ?? null)}
        onClear={() => setHighlightId(null)}
      />
    </div>
  );
};

export { Highlight };
