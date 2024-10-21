import { FC, useMemo, useState, useTransition } from "react";
import { useParams } from "react-router";
import {
  getStageTransKey,
  getTournamentTitle,
  transformTournamentPart,
} from "@fbs2.0/utils";
import { StageSubstitution, Tournament as TournamentType } from "@fbs2.0/types";
import { useTranslation } from "react-i18next";
import { Collapse, CollapseProps } from "antd";
import {
  CaretRightOutlined,
  LoadingOutlined,
  SwapOutlined,
} from "@ant-design/icons";

import { Page } from "../../components/Page";
import { Stage, StageProps } from "./components/Stage";
import { SubstitutionDialog } from "./components/SubstitutionDialog";
import {
  getPreviousTournamentPart,
  prepareStageParticipants,
} from "./components/Stage/utils";
import { Participants } from "./components/Participants";
import { Header } from "./components/Header";
import { TournamentMenu } from "./components/TournamentMenu";
import { useGetMatches } from "../../react-query-hooks/match/useGetMatches";
import { useGetParticipants } from "../../react-query-hooks/participant/useGetParticipants";

import styles from "./styles.module.scss";

const Tournament: FC = () => {
  const { t } = useTranslation();
  const { season, tournament } = useParams();
  const [isPending, startTransition] = useTransition();

  const rawMatches = useGetMatches(season, tournament);
  const participants = useGetParticipants(season, tournament);

  const [participantsDialogOpened, setParticipantsDialogOpened] =
    useState(false);

  const [activeKey, setActiveKey] = useState<(number | string)[]>();

  const [substitutionDialogData, setSubstitutionDialogData] = useState<{
    stageId: number;
    stageParticipants: StageProps["participants"];
    currentSubstitutions: StageSubstitution[] | undefined;
  } | null>(null);

  const items = useMemo<CollapseProps["items"]>(
    () =>
      rawMatches.data
        ?.map((tournamentPart) => ({
          stage: tournamentPart.stage,
          matches: transformTournamentPart(tournamentPart),
        }))
        .map((tournamentPart, _, tournamentParts) => {
          const previousTournamentPart = getPreviousTournamentPart(
            tournamentParts,
            tournamentPart.stage
          );

          const stageParticipants = prepareStageParticipants(
            participants.data,
            tournamentPart,
            previousTournamentPart,
            getPreviousTournamentPart(
              tournamentParts,
              previousTournamentPart?.stage
            )
          );

          const stageHasParticipants = Object.values(stageParticipants).some(
            (list) => (list?.length || 0) > 0
          );

          return {
            key: tournamentPart.stage.id,
            classNames: { header: styles["collapse-header"] },
            children: (
              <Stage
                tournamentPart={tournamentPart}
                participants={stageParticipants}
                loading={rawMatches.isLoading}
              />
            ),
            label: t(getStageTransKey(tournamentPart.stage.stageType)),
            extra: stageHasParticipants && (
              <SwapOutlined
                onClick={(event) => {
                  event.stopPropagation();
                  setSubstitutionDialogData({
                    stageId: tournamentPart.stage.id,
                    stageParticipants,
                    currentSubstitutions:
                      tournamentPart.stage.stageSubstitutions,
                  });
                }}
                disabled={
                  substitutionDialogData?.stageId !== tournamentPart.stage.id
                }
              />
            ),
          };
        }),
    [
      participants.data,
      rawMatches.data,
      rawMatches.isLoading,
      substitutionDialogData?.stageId,
      t,
    ]
  );

  const title = `${t(
    getTournamentTitle({
      season,
      tournament: tournament as TournamentType,
    })
  )} ${season}`;

  return (
    <Page
      isLoading={rawMatches.isLoading}
      title={title}
      menu={<TournamentMenu />}
      className={styles[`tournament-${tournament}`]}
    >
      <Header
        title={title}
        season={season}
        tournament={tournament}
        onParticipants={() => setParticipantsDialogOpened(true)}
      />

      <Participants
        onClose={() => setParticipantsDialogOpened(false)}
        open={participantsDialogOpened}
      />
      <Collapse
        bordered={false}
        activeKey={activeKey}
        items={items}
        onChange={(key) => {
          startTransition(() => {
            setActiveKey(key);
          });
        }}
        expandIcon={({ isActive }) =>
          isPending ? (
            <LoadingOutlined />
          ) : (
            <CaretRightOutlined rotate={isActive ? 90 : 0} />
          )
        }
      />
      {substitutionDialogData !== null && (
        <SubstitutionDialog
          stageId={substitutionDialogData?.stageId}
          stageParticipants={substitutionDialogData.stageParticipants}
          currentSubstitutions={substitutionDialogData.currentSubstitutions}
          close={() => setSubstitutionDialogData(null)}
        />
      )}
    </Page>
  );
};

export { Tournament };
