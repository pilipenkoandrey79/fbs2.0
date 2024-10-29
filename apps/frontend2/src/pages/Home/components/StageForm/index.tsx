import { CloseOutlined, PlusOutlined } from "@ant-design/icons";
import {
  DEFAULT_GROUPS_QUANTITY,
  DEFAULT_SWISS_LENGTH,
  StageDto,
  StageSchemeType,
  StageType,
  TournamentDto,
} from "@fbs2.0/types";
import {
  Button,
  Card,
  Checkbox,
  Divider,
  Form,
  FormInstance,
  FormListFieldData,
  InputNumber,
  Segmented,
} from "antd";
import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";

import { StageTypeSelector } from "../../../../components/selectors/StageTypeSelector";
import { StageSchemeSelector } from "../../../../components/selectors/StageSchemeSelector";
import { getDefaultSchemeByType, isGroup, isOlimpic } from "./utils";
import { TournamentSelector } from "../../../../components/selectors/TournamentSelector";

import styles from "./styles.module.scss";
import variables from "../../../../style/variables.module.scss";

export type StageFormItemType = StageDto & FormListFieldData;

interface Props {
  form: FormInstance<TournamentDto>;
  stage: StageFormItemType;
  remove: () => void;
  addAfter: () => void;
}

const StageForm: FC<Props> = ({ stage, remove, addAfter, form }) => {
  const { t } = useTranslation();

  const [hasLinked, setHasLinked] = useState(false);

  const isMdScreen = useMediaQuery({
    query: `(min-width: ${variables.screenMd})`,
  });

  return (
    <Card size="small" className={styles.stage}>
      <CloseOutlined
        onClick={() => {
          remove();
        }}
        className={styles.remove}
      />
      <Button
        icon={<PlusOutlined />}
        className={styles.plus}
        size="small"
        onClick={() => {
          addAfter();
        }}
      />
      <div className={styles.container}>
        <div className={styles["stage-section"]}>
          <Form.Item noStyle name="previousStageType"></Form.Item>
          <StageTypeSelector
            name={[stage.name, "stageType"]}
            label={t("home.tournament.stage.type")}
            onChange={(stageType: StageType) => {
              form.setFieldValue(
                ["stages", stage.name, "stageSchemeType"],
                getDefaultSchemeByType(stageType)
              );
            }}
          />
          <Form.Item
            name={[stage.name, "isStarting"]}
            label={t("home.tournament.stage.isStarting")}
            valuePropName="checked"
          >
            <Checkbox />
          </Form.Item>
        </div>
        <Divider type={isMdScreen ? "vertical" : "horizontal"} />
        <div className={styles["stage-section"]}>
          <StageSchemeSelector
            name={[stage.name, "stageSchemeType"]}
            label={t("home.tournament.stage.scheme.title")}
          />

          {isOlimpic(
            form.getFieldValue(["stages", stage.name, "stageSchemeType"])
          ) && (
            <>
              <Form.Item
                name={[stage.name, "awayGoal"]}
                label={t("home.tournament.stage.awayGoal")}
                valuePropName="checked"
              >
                <Checkbox />
              </Form.Item>
              <Form.Item name={[stage.name, "pen"]}>
                <Segmented
                  options={[
                    {
                      label: t("home.tournament.stage.pen"),
                      value: true,
                    },
                    {
                      label: t("home.tournament.stage.replay"),
                      value: false,
                    },
                  ]}
                />
              </Form.Item>
            </>
          )}
          {isGroup(
            form.getFieldValue(["stages", stage.name, "stageSchemeType"])
          ) && (
            <Form.Item
              name={[stage.name, "groups"]}
              initialValue={DEFAULT_GROUPS_QUANTITY}
              label={t("home.tournament.stage.group")}
            >
              <InputNumber min={1} controls changeOnWheel />
            </Form.Item>
          )}
          {form.getFieldValue(["stages", stage.name, "stageSchemeType"]) ===
            StageSchemeType.LEAGUE && (
            <Form.Item
              name={[stage.name, "swissNum"]}
              initialValue={DEFAULT_SWISS_LENGTH}
              label={t("home.tournament.stage.swiss")}
            >
              <InputNumber min={1} controls changeOnWheel />
            </Form.Item>
          )}
        </div>
        <Divider type="horizontal" />
        <div className={styles["stage-section"]}>
          <Checkbox
            checked={hasLinked}
            onChange={() => {
              setHasLinked(!hasLinked);

              ["linkedTournament", "linkedStage"].forEach((key) => {
                form.setFieldValue(
                  [
                    "stages",
                    stage.name,
                    key as "linkedTournament" | "linkedStage",
                  ],
                  undefined
                );
              });
            }}
          >
            {t("home.tournament.stage.relegation")}
          </Checkbox>
          {hasLinked && (
            <div className={styles["linked-tournament"]}>
              <TournamentSelector
                startOfSeason={form.getFieldValue("start")}
                existenceValidation={false}
                exclude={form.getFieldValue("tournament")}
                name={[stage.name, "linkedTournament"]}
              />
              <StageTypeSelector
                name={[stage.name, "linkedStage"]}
                label={t("home.tournament.stage.type")}
                required={false}
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export { StageForm };
