import {
  Participant,
  StageInternal,
  Tournament,
  UKRAINE,
  USSR,
} from "@fbs2.0/types";
import { Table, TableProps } from "antd";
import { FC, useContext } from "react";
import { useTranslation } from "react-i18next";
import { isNotEmpty } from "@fbs2.0/utils";
import classNames from "classnames";

import { StageParticipant } from "../StageParticipant";
import { HighlightContext } from "../../../../../../../../context/highlightContext";
import { BCP47Locales, Language } from "../../../../../../../../i18n/locales";

import styles from "./styles.module.scss";

interface Props {
  title: string;
  participants: Participant[] | undefined;
  stage: StageInternal;
}

const getParticipantClasses = (
  participant: Participant,
  tournament: Tournament,
  highlightedClubId: number | null
) =>
  classNames({
    [styles["from-another-tournament"]]: isNotEmpty(participant.fromStage),
    [styles.mine]: [UKRAINE, USSR].includes(participant.club.city.country.name),
    [styles[`highlighted-${tournament}`]]:
      participant.club.id === highlightedClubId,
  });

const ParticipantsList: FC<Props> = ({ title, participants, stage }) => {
  const { t, i18n } = useTranslation();

  const collator = new Intl.Collator(
    BCP47Locales[i18n.resolvedLanguage as Language]
  );

  const { highlightId } = useContext(HighlightContext);

  const columns: TableProps<Participant>["columns"] = [
    {
      key: "no",
      rowScope: "row",
      width: 20,
      render: (_, __, index) => index + 1,
    },
    {
      key: "club",
      title: t("tournament.stages.participants.team"),
      width: 120,
      ellipsis: true,
      showSorterTooltip: { target: "full-header" },
      sorter: (a: Participant, b: Participant) =>
        collator.compare(
          (i18n.resolvedLanguage === Language.en
            ? a.club.name
            : a.club.name_ua) || a.club.name,
          (i18n.resolvedLanguage === Language.en
            ? b.club.name
            : b.club.name_ua) || b.club.name
        ),
      render: (participant: Participant) => (
        <StageParticipant
          stage={stage}
          participant={participant}
          className={getParticipantClasses(
            participant,
            stage.tournamentSeason.tournament,
            highlightId
          )}
        />
      ),
    },
  ];

  return (
    <div>
      <Table<Participant>
        columns={columns}
        dataSource={participants}
        rowKey="id"
        size="small"
        pagination={false}
        title={() => title}
      />
    </div>
  );
};

export { ParticipantsList };
