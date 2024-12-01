import { DeleteOutlined } from "@ant-design/icons";
import {
  Stage,
  StageSchemeType,
  StageType,
  StageUpdateDto,
  TournamentSeason,
} from "@fbs2.0/types";
import {
  Card,
  Checkbox,
  Divider,
  Form,
  InputNumber,
  Popconfirm,
  Segmented,
  Typography,
} from "antd";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";
import { getTournamentTitle } from "@fbs2.0/utils";

import { isGroup, isOlimpic } from "../../../../utils";
import { SubmitButton } from "../../../../../../components/SubmitButton";
import { useUpdateStage } from "../../../../../../react-query-hooks/tournament/useUpdateStage";
import { useDeleteStage } from "../../../../../../react-query-hooks/tournament/useDeleteStage";

import styles from "./styles.module.scss";
import variables from "../../../../../../style/variables.module.scss";

interface Props {
  stage: Stage;
  tournamentSeason: TournamentSeason;
  index: number;
}

const StageItem: FC<Props> = ({ stage, tournamentSeason, index }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<StageUpdateDto>();

  const isMdScreen = useMediaQuery({
    query: `(min-width: ${variables.screenMd})`,
  });

  const updateStage = useUpdateStage(tournamentSeason, stage.id);
  const deleteStage = useDeleteStage(tournamentSeason, stage.id);

  const initialValues: StageUpdateDto = {
    isStarting: stage.stageScheme.isStarting,
    pen: stage.stageScheme.pen ?? false,
    awayGoal: stage.stageScheme.awayGoal ?? false,
    groups: stage.stageScheme.groups,
    swissNum: stage.stageScheme.swissNum ?? undefined,
    swissTours: stage.stageScheme.swissTours ?? undefined,
  };

  return (
    <Form<StageUpdateDto>
      form={form}
      onFinish={async (values) => await updateStage.mutateAsync(values)}
      layout="inline"
      initialValues={initialValues}
      disabled={updateStage.isPending}
    >
      <Card size="small" className={styles.stage}>
        {stage.matchesCount === 0 && index > 0 && (
          <Popconfirm
            onConfirm={async () => await deleteStage.mutateAsync()}
            title={t("home.tournament.stage.remove")}
          >
            <DeleteOutlined className={styles.remove} />
          </Popconfirm>
        )}
        <div className={styles.container}>
          <div className={styles["stage-section"]}>
            <Typography.Paragraph>
              {t("home.tournament.stage.type")}:{" "}
              {t(
                `tournament.stage.${stage.stageType}${
                  stage.stageType === StageType.GROUP ||
                  stage.stageType === StageType.GROUP_2
                    ? ".short"
                    : ""
                }`
              )}
            </Typography.Paragraph>
            <Form.Item
              name="isStarting"
              label={t("home.tournament.stage.isStarting")}
              valuePropName="checked"
            >
              <Checkbox disabled={index === 0} />
            </Form.Item>
          </div>
          <Divider
            type={isMdScreen ? "vertical" : "horizontal"}
            className={styles.divider}
          />
          <div className={styles["stage-section"]}>
            <Typography.Paragraph>
              {t("home.tournament.stage.scheme.title")}:{" "}
              {t(`home.tournament.stage.scheme.${stage.stageScheme.type}`)}
            </Typography.Paragraph>

            {isOlimpic(stage.stageScheme.type) && (
              <>
                <Form.Item
                  name="awayGoal"
                  label={t("home.tournament.stage.awayGoal")}
                  valuePropName="checked"
                >
                  <Checkbox />
                </Form.Item>
                <Form.Item name="pen">
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
            {isGroup(stage.stageScheme.type) && (
              <Form.Item name="groups" label={t("home.tournament.stage.group")}>
                <InputNumber min={1} controls changeOnWheel />
              </Form.Item>
            )}
            {stage.stageScheme.type === StageSchemeType.LEAGUE && (
              <>
                <Form.Item
                  name="swissNum"
                  label={t("home.tournament.stage.swiss")}
                >
                  <InputNumber min={1} controls changeOnWheel />
                </Form.Item>
                <Form.Item
                  name="swissTours"
                  label={t("home.tournament.stage.swiss_tours")}
                >
                  <InputNumber min={1} controls changeOnWheel />
                </Form.Item>
              </>
            )}
          </div>
          {stage.linkedTournament && (
            <>
              <Divider type="horizontal" className={styles.divider} />
              <div className={styles["stage-section"]}>
                <div className={styles["linked-tournament"]}>
                  <Typography.Paragraph>
                    {t("home.tournament.stage.relegation")}:
                  </Typography.Paragraph>
                  <Typography.Paragraph>{`${t(
                    getTournamentTitle({
                      season: tournamentSeason.season,
                      tournament: stage.linkedTournament,
                    })
                  )} ${tournamentSeason.season} ${t(
                    `tournament.stage.${stage.linkedTournamentStage}${
                      stage.linkedTournamentStage === StageType.GROUP ||
                      stage.linkedTournamentStage === StageType.GROUP_2
                        ? ".short"
                        : ""
                    }`
                  )}`}</Typography.Paragraph>
                </div>
              </div>
            </>
          )}
          <div className={styles.submit}>
            <SubmitButton form={form} label={t("common.save")} size="small" />
          </div>
        </div>
      </Card>
    </Form>
  );
};

export { StageItem };
