import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Checkbox, Flex, Form, FormInstance, InputNumber } from "antd";
import { ClubWithWinner, MatchesDto } from "@fbs2.0/types";
import { NamePath } from "antd/es/form/interface";

import { Club } from "../../../../../../../../../../../../../../components/Club";

import styles from "./styles.module.scss";

interface Props {
  form: FormInstance<MatchesDto>;
  name: NamePath;
  host: ClubWithWinner;
  guest: ClubWithWinner;
}

const Deduction: FC<Props> = ({ form, name, host, guest }) => {
  const { t } = useTranslation();

  const [showDeduction, setShowDeduction] = useState(
    () =>
      ((
        form.getFieldValue([
          "matches",
          name[0],
          "deductedPointsList",
        ] as NamePath) || []
      ).length || 0) > 0,
  );

  useEffect(() => {
    if (showDeduction) {
      form.setFieldValue(
        ["matches", name[0], "deductedPointsList", 0, "participant"],
        { id: host.id },
      );

      form.setFieldValue(
        ["matches", name[0], "deductedPointsList", 1, "participant"],
        { id: guest.id },
      );
    } else {
      form.setFieldValue(["matches", name[0], "deductedPointsList"], []);
    }
  }, [showDeduction]);

  return (
    <div className={styles.deduction}>
      <label>
        {t("tournament.stages.matches.form.deduction")}{" "}
        <Checkbox
          checked={showDeduction}
          onChange={() => setShowDeduction(!showDeduction)}
        />
      </label>
      {showDeduction && (
        <Flex>
          <Form.Item
            noStyle
            name={[name[0], "deductedPointsList", 0, "participant"]}
          />
          <Form.Item
            name={[name[0], "deductedPointsList", 0, "points"]}
            label={
              <Club
                club={host.club}
                to={false}
                showCity={false}
                showCountry={false}
              />
            }
            className={styles["deduction-item"]}
          >
            <InputNumber min={0} controls changeOnWheel size="small" />
          </Form.Item>
          <Form.Item
            noStyle
            name={[name[0], "deductedPointsList", 1, "participant"]}
          />
          <Form.Item
            name={[name[0], "deductedPointsList", 1, "points"]}
            label={
              <Club
                club={guest.club}
                to={false}
                showCity={false}
                showCountry={false}
              />
            }
            className={styles["deduction-item"]}
          >
            <InputNumber min={0} controls changeOnWheel size="small" />
          </Form.Item>
        </Flex>
      )}
    </div>
  );
};

export { Deduction };
